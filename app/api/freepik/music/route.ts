import { NextResponse } from "next/server";
import * as z from "zod";
import { usersTable } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import db from "@/index";
/**
 * user utils import
 */
import { getUserId, hasSubscription } from "@/lib/user-utils";
import { getUserGenerationCount } from "@/lib/user-utils";
import { ensureUserExists } from "@/lib/user-utils";
import { incrementUserGenerationCount } from "@/lib/user-utils";
const BodySchema = z.object({
  prompt: z.string().min(1),
});

// Configuration for patient polling
const POLLING_CONFIG = {
  MAX_WAIT_TIME: 5 * 60 * 1000, // 5 minutes
  POLL_INTERVAL: 3000, // Check every 3 seconds
};

export async function POST(req: Request) {
  try {
     const userId = await getUserId();
   //ensure the user exists
   await ensureUserExists(userId);
  const totalgenerations = process.env.MAX_GENERATIONS ? parseInt(process.env.MAX_GENERATIONS) : 6;
  const usergenerations = await getUserGenerationCount(userId);
  const havesubscription=await hasSubscription('pro');
  
  if (!havesubscription && usergenerations >= totalgenerations) {
    return NextResponse.json({ error: 'you have exceeded your generation limit' }, { status: 403 });
  }

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }
      // Check if user exists in database, if not create them
        try {
          const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, userId))
            .limit(1);
    
          if (existingUser.length === 0) {
            // Get user info from Clerk
            let userEmail = null;
            let userName = null;
            
            try {
              const client = await clerkClient();
              const clerkUser = await client.users.getUser(userId);
              
              userEmail = clerkUser.emailAddresses[0]?.emailAddress || null;
              userName = clerkUser.firstName && clerkUser.lastName 
                ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
                : clerkUser.firstName 
                ? clerkUser.firstName 
                : clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || null;
            } catch (clerkError) {
              console.warn("Could not fetch user details from Clerk:", clerkError);
              userName = `user_${userId.substring(0, 8)}`;
            }
    
            await db.insert(usersTable).values({
              id: userId,
              email: userEmail,
              name: userName,
            });
            console.log(`✅ Created new user in database: ${userId}`);
          } else {
            console.log(`✅ User already exists in database: ${userId}`);
          }
        } catch (userError) {
          console.error("Error checking/creating user:", userError);
        }

    const base = "https://api.freepik.com/v1";
    const key = process.env.FREEPIK_API_KEY?.trim();
    
    if (!key) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    // Step 1: Create the sound effect task with correct parameters
    const createRes = await fetch(`${base}/ai/sound-effects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-freepik-api-key": key,
      },
      body: JSON.stringify({
        text: parsed.data.prompt, // API uses "text" not "prompt"
        duration_seconds: 5,      // Default: 5 seconds
        loop: false,              // Default: no loop
        prompt_influence: 0.3,    // Default influence
      }),
    });

    const createData = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json({ 
        error: "api_error", 
        message: createData.message 
      }, { status: createRes.status });
    }

    const taskId = createData.data?.task_id;

    // Step 2: Poll for completion
    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < POLLING_CONFIG.MAX_WAIT_TIME) {
      attempts++;
      
      try {
        // Check task status - endpoint is /ai/sound-effects/{taskId}
        const statusUrl = `${base}/ai/sound-effects/${taskId}`;
        const statusRes = await fetch(statusUrl, {
          headers: {
            "x-freepik-api-key": key,
          },
        });
        
        if (statusRes.ok) {
          const statusData = await statusRes.json();
          const currentStatus = statusData.data?.status;
          const soundUrl = statusData.data?.generated?.[0];
          
          if (currentStatus === "COMPLETED" && soundUrl) {
            await incrementUserGenerationCount(userId,1);
            const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
            return NextResponse.json({
              success: true,
              audio_url: soundUrl,
              task_id: taskId,
              status: currentStatus,
              wait_time_seconds: elapsedSeconds,
              attempts: attempts,
            });
               
          }
          
          if (currentStatus === "FAILED") {
            return NextResponse.json({
              success: false,
              task_id: taskId,
              status: currentStatus,
              error: "Sound generation failed",
            });
          }
        }
      } catch (error) {
        // Continue polling on error
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, POLLING_CONFIG.POLL_INTERVAL));
    }
    
    // Timeout
    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
    return NextResponse.json({
      success: false,
      task_id: taskId,
      status: "TIMEOUT",
      message: `Sound generation timed out after ${totalSeconds} seconds`,
    }, { status: 408 });

  } catch (e: any) {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}