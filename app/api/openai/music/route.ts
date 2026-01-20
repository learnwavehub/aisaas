import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { Buffer } from "buffer";
/**
 * user utils import
 */
import { getUserId, hasSubscription } from "@/lib/user-utils";
import { getUserGenerationCount } from "@/lib/user-utils";
import { ensureUserExists } from "@/lib/user-utils";
import { incrementUserGenerationCount } from "@/lib/user-utils";

function pcmToWavBuffer(pcmData: Buffer, sampleRate = 48000, numChannels = 2): Buffer {
  const blockAlign = numChannels * 2;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const buffer = Buffer.alloc(44 + dataSize);
  
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  pcmData.copy(buffer, 44);
  
  return buffer;
}

export async function POST(req: NextRequest) {
         const userId = await getUserId();
   //ensure the user exists
   await ensureUserExists(userId);
  const totalgenerations = process.env.MAX_GENERATIONS ? parseInt(process.env.MAX_GENERATIONS) : 6;
  const usergenerations = await getUserGenerationCount(userId);
  const havesubscription=  await hasSubscription('pro');
  
  if (!havesubscription && usergenerations >= totalgenerations) {
    return NextResponse.json({ error: 'you have exceeded your free generation limit' }, { status: 403 });
  }

  try {
    const { prompt } = await req.json();
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
    
    const client = new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      apiVersion: "v1alpha",
    });

    const audioChunks: string[] = [];

    const session = await client.live.music.connect({
      model: "models/lyria-realtime-exp",
      callbacks: {
        onmessage: (message) => {
          if (message.serverContent?.audioChunks) {
            for (const chunk of message.serverContent.audioChunks) {
              if (chunk.data && typeof chunk.data === 'string') {
                audioChunks.push(chunk.data);
              }
            }
          }
        },
        onerror: (error) => console.error("Session error:", error),
        onclose: () => console.log("Stream closed"),
      },
    });

    await session.setWeightedPrompts({
      weightedPrompts: [{ text: prompt, weight: 1.0 }],
    });

    await session.setMusicGenerationConfig({
      musicGenerationConfig: { bpm: 90, temperature: 1.0 },
    });

    await session.play();
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
    await session.stop();

    if (audioChunks.length === 0) {
      throw new Error("No audio received");
    }

    // Convert PCM to WAV
    const combinedBase64 = audioChunks.join('');
    const pcmBuffer = Buffer.from(combinedBase64, 'base64');
    const wavBuffer = pcmToWavBuffer(pcmBuffer);
    const audioDataUrl = `data:audio/wav;base64,${wavBuffer.toString('base64')}`;
    await incrementUserGenerationCount(userId, 1);
    return NextResponse.json({
      success: true,
      audio_url: audioDataUrl,
      duration: 10,
      prompt: prompt,
    });

  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}