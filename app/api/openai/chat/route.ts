import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import db from "@/index";
import { chatTable } from "@/db/schema"; 
/**
 * user utils import
 */
import { getUserId, hasSubscription } from "@/lib/user-utils";
import { getUserGenerationCount } from "@/lib/user-utils";
import { ensureUserExists } from "@/lib/user-utils";
import { incrementUserGenerationCount } from "@/lib/user-utils";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

// Store conversation history in memory (for demo - use database in production)
const conversationStore = new Map<string, Array<{role: string, content: string}>>();

export async function POST(req: Request) {

      const userId = await getUserId();
   //ensure the user exists
   await ensureUserExists(userId);
  const totalgenerations = process.env.MAX_GENERATIONS ? parseInt(process.env.MAX_GENERATIONS) : 6;
  const usergenerations = await getUserGenerationCount(userId);
  const havesubscription= await hasSubscription('pro');
  
  if (!havesubscription && usergenerations >= totalgenerations) {
    return NextResponse.json({ error: 'you have exceeded your generation limit' }, { status: 403 });
  }
  try {
    const { message, conversationId = "default" } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get or create conversation history
    if (!conversationStore.has(conversationId)) {
      conversationStore.set(conversationId, []);
    }
    const history = conversationStore.get(conversationId)!;

    // Add user message to history
    history.push({ role: "user", content: message });

    // Prepare conversation for Gemini
    const conversationForGemini = history.map(msg => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: conversationForGemini,
      config: {
        systemInstruction: "You are a helpful, friendly, and knowledgeable AI assistant. Provide clear, accurate, and concise answers. Be engaging and maintain a natural conversational tone.",
        temperature: 0.7,
        topP: 0.8,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const aiResponse = response.text?.trim() || "";

    // Add AI response to history
    history.push({ role: "assistant", content: aiResponse });

    // Limit history length (keep last 10 messages)
    if (history.length > 20) {
      conversationStore.set(conversationId, history.slice(-20));
    }
  //// ✅ NEW: Save to chatTable in the background
   try {
  
      await db.insert(chatTable).values({
        id:  `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        userId: userId,
        prompt: message,
        response: aiResponse,
        createdAt: new Date(),
      });
      console.log(`✅ Chat saved to database for user: ${userId}`);
    } catch (saveError) {
      // Log but don't fail the request if saving fails
      console.error("Failed to save chat to database:", saveError);
      // Continue with the response - don't let DB errors affect user experience
    }
    await incrementUserGenerationCount(userId, 1);
    return NextResponse.json({
      message: aiResponse,
      conversationId,
      historyLength: history.length
    });

  } catch (error: any) {
    console.error("Chat API error:", error);
    
    return NextResponse.json({
      message: "I apologize, but I'm having trouble responding right now. Please try again.",
      error: error.message
    }, { status: 500 });
  }
}