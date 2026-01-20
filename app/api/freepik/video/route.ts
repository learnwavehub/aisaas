import { NextResponse } from "next/server";
import * as z from "zod";
/**
 * user utils import
 */
import { getUserId, hasSubscription } from "@/lib/user-utils";
import { getUserGenerationCount } from "@/lib/user-utils";
import { ensureUserExists } from "@/lib/user-utils";
import { incrementUserGenerationCount } from "@/lib/user-utils";

const BodySchema = z.object({
  prompt: z.string().min(1).max(2000),
});

// Configuration for patient polling (10 minutes max)
const POLLING_CONFIG = {
  MAX_WAIT_TIME: 10 * 60 * 1000, // 10 minutes
  POLL_INTERVAL: 3000, // Check every 3 seconds
};

export async function POST(req: Request) {
  console.log("🎬 === VIDEO API: Simplified Polling ===");
 
  try {
    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
          const userId = await getUserId();
   //ensure the user exists
   await ensureUserExists(userId);
  const totalgenerations = process.env.MAX_GENERATIONS ? parseInt(process.env.MAX_GENERATIONS) : 6;
  const usergenerations = await getUserGenerationCount(userId);
  const havesubscription= await hasSubscription('pro');
  
  if (!havesubscription && usergenerations >= totalgenerations) {
    return NextResponse.json({ error: 'you have exceeded your generation limit' }, { status: 403 });
  }
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const base = process.env.FREEPIK_API_BASE || "https://api.freepik.com/v1";
    const key = process.env.FREEPIK_API_KEY?.trim();
    
    if (!key) {
      return NextResponse.json({ error: "missing_freepik_config" }, { status: 500 });
    }

    // Step 1: Create the video task
    const requestBody = {
      prompt: parsed.data.prompt,
      duration: 6,
      prompt_optimizer: true,
    };

    console.log(`📝 Prompt: "${parsed.data.prompt.substring(0, 50)}..."`);
    
    const createRes = await fetch(`${base}/ai/image-to-video/minimax-hailuo-02-768p`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-freepik-api-key": key,
      },
      body: JSON.stringify(requestBody),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      console.error("❌ Task creation failed:", createData);
      return NextResponse.json({ 
        error: "api_error", 
        details: createData 
      }, { status: createRes.status });
    }

    const taskId = createData.data?.task_id;
    console.log(`✅ Task created: ${taskId}`);

    // Step 2: Poll for completion
    const startTime = Date.now();
    let attempts = 0;
    
    console.log("🔄 Starting polling for video URL...");
    
    while (Date.now() - startTime < POLLING_CONFIG.MAX_WAIT_TIME) {
      attempts++;
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      
      console.log(`\nAttempt ${attempts} (${elapsedSeconds}s elapsed)`);
      
      try {
        // Now we know the exact endpoint format!
        const statusUrl = `${base}/ai/image-to-video/minimax-hailuo-02-768p/${taskId}`;
        console.log(`Checking: ${statusUrl}`);
        
        const statusRes = await fetch(statusUrl, {
          headers: {
            "x-freepik-api-key": key,
          },
        });
        
        if (!statusRes.ok) {
          console.log(`Status check failed: ${statusRes.status}`);
          continue;
        }
        
        const statusData = await statusRes.json();
        console.log(`Response:`, JSON.stringify(statusData, null, 2));
        
        const currentStatus = statusData.data?.status;
        const videoUrl = statusData.data?.generated?.[0];
        
        console.log(`Status: ${currentStatus}, Has video: ${!!videoUrl}`);
        
        if (currentStatus === "COMPLETED" && videoUrl) {
          console.log(`🎉 VIDEO READY after ${elapsedSeconds}s!`);
          console.log(`Video URL: ${videoUrl.substring(0, 100)}...`);
          await incrementUserGenerationCount(userId,1);
          return NextResponse.json({
            success: true,
            video_url: videoUrl,
            task_id: taskId,
            status: currentStatus,
            wait_time_seconds: elapsedSeconds,
            attempts: attempts,
          });
        }
        
        if (currentStatus === "FAILED") {
          console.log(`❌ Task failed`);
          return NextResponse.json({
            success: false,
            task_id: taskId,
            status: currentStatus,
            error: "Video generation failed",
            wait_time_seconds: elapsedSeconds,
            attempts: attempts,
          });
        }
        
        // Still processing
        console.log(`⏳ Status: ${currentStatus || "PROCESSING"}...`);
        
      } catch (error: any) {
        console.log(`Polling error: ${error.message}`);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, POLLING_CONFIG.POLL_INTERVAL));
    }
    
    // Timeout
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    console.log(`\n⏰ Timeout after ${totalSeconds}s`);
    
    return NextResponse.json({
      success: false,
      task_id: taskId,
      status: "TIMEOUT",
      message: `Video generation timed out after ${totalSeconds} seconds`,
      wait_time_seconds: totalSeconds,
      attempts: attempts,
    }, { status: 408 });

  } catch (e: any) {
    console.error("Server error:", e);
    return NextResponse.json({ 
      error: "server_error",
      message: e.message
    }, { status: 500 });
  }
}

// Helper endpoint for manual status checking
export async function GET(req: Request) {
    
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('task_id');
  
  if (!taskId) {
    return NextResponse.json({ 
      error: "task_id_required",
      message: "Task ID is required" 
    }, { status: 400 });
  }
  
  console.log(`Manual status check for task: ${taskId}`);
  
  const base = process.env.FREEPIK_API_BASE || "https://api.freepik.com/v1";
  const key = process.env.FREEPIK_API_KEY?.trim();
  
  if (!key) {
    return NextResponse.json({ error: "missing_freepik_config" }, { status: 500 });
  }
  
  try {
    const statusUrl = `${base}/ai/image-to-video/minimax-hailuo-02-768p/${taskId}`;
    const res = await fetch(statusUrl, {
      headers: { "x-freepik-api-key": key },
    });
    
    if (!res.ok) {
      return NextResponse.json({ 
        error: "status_check_failed",
        status: res.status 
      }, { status: res.status });
    }
    
    const data = await res.json();
    const videoUrl = data.data?.generated?.[0];
    
    return NextResponse.json({
      task_id: taskId,
      status: data.data?.status,
      video_url: videoUrl,
      has_video: !!videoUrl,
      data: data,
      checked_at: new Date().toISOString(),
    });
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: "check_error", 
      message: error.message 
    }, { status: 500 });
  }
}