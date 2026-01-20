import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import db from "@/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { codeTable } from "@/db/schema";
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

export async function POST(req: Request) {
  try {
        const userId = await getUserId();
   //ensure the user exists
   await ensureUserExists(userId);
  const totalgenerations = process.env.MAX_GENERATIONS ? parseInt(process.env.MAX_GENERATIONS) : 6;
  const usergenerations = await getUserGenerationCount(userId);
  const havesubscription= await hasSubscription('pro');
  
  if (!havesubscription && usergenerations >= totalgenerations) {
    return NextResponse.json({ error: 'you have exceeded your free generation limit' }, { status: 403 });
  }

    // Check/validate request body
    const { prompt } = await req.json();
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
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
        
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        
        userEmail = clerkUser.emailAddresses[0]?.emailAddress || null;
        userName = clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
          : clerkUser.firstName 
          ? clerkUser.firstName 
          : clerkUser.emailAddresses[0]?.emailAddress?.split('@')[0] || null;

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
      // Continue anyway - don't fail the request if user creation fails
    }

    // Generate AI response
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a helpful code generation assistant. Generate clean, production-ready code based on user requests. Output ONLY the code without explanations or markdown formatting. Include necessary imports and follow best practices for the language mentioned.",
        temperature: 0.2,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    });

    const code = response.text?.trim() || "";
  //save code generation to database
   // Save to codeTable
    try {
      await db.insert(codeTable).values({
       id:  `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        userId: userId,
        prompt: prompt,
        response: code,
        createdAt: new Date(),
      });
      console.log(`✅ Code saved to database for user: ${userId}`);
    } catch (saveError) {
      console.error("Failed to save code to database:", saveError);
      // Continue with response even if save fails
    }
    await incrementUserGenerationCount(userId, 1);
    return NextResponse.json({
      code: code,
      model: "gemini-2.5-flash",
    });

  } catch (error: any) {
    console.error("Gemini API error:", error);
    
    return NextResponse.json({
      warning: "Using fallback - API error occurred",
      error: error.message
    });
  }
}