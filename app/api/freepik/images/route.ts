import { NextResponse } from "next/server";
import * as z from "zod";
import db from "@/index";
import { imagesTable, insertImage, insertUser, usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
/**
 * user utils import
 */
import { getUserId, hasSubscription } from "@/lib/user-utils";
import { getUserGenerationCount } from "@/lib/user-utils";
import { ensureUserExists } from "@/lib/user-utils";
import { incrementUserGenerationCount } from "@/lib/user-utils";

const BodySchema = z.object({
  prompt: z.string().min(3, "Prompt must be at least 3 characters"),
  num_images: z.number().min(1).max(4).optional().default(1),
  image: z.object({
    size: z.enum(["square_1_1", "portrait_2_3", "landscape_16_9", "tall_9_16"]).optional().default("square_1_1"),
  }).optional(),
  guidance_scale: z.number().min(0).max(2).optional().default(1.0),
  filter_nsfw: z.boolean().optional().default(true),
});

export async function POST(req: Request) {
  const userId = await getUserId();
   //ensure the user exists
   await ensureUserExists(userId);
  const totalgenerations = process.env.MAX_GENERATIONS ? parseInt(process.env.MAX_GENERATIONS) : 6;
  const usergenerations = await getUserGenerationCount(userId);
  const havesubscription=await hasSubscription('pro');
  
  if (!havesubscription && usergenerations >= totalgenerations) {
    return NextResponse.json({ error: 'you have exceeded your generation limit' }, { status: 403 });
  }

  try {
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

      
        const newUser:insertUser={
          id: userId,
          email: userEmail,
          name: userName,
      
        }
        await db.insert(usersTable).values(newUser);
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

    const headers = {
      'Content-Type': 'application/json',
      'x-freepik-api-key': key,
    };

    const requestBody = {
      prompt: parsed.data.prompt,
      num_images: parsed.data.num_images,
      image: parsed.data.image || { size: "square_1_1" },
      guidance_scale: parsed.data.guidance_scale,
      filter_nsfw: parsed.data.filter_nsfw,
    };

    const res = await fetch(`${base}/ai/text-to-image`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "freepik_api_error", message: data.message },
        { status: res.status }
      );
    }

    // EXTRACT BASE64 IMAGES - From the working frontend, we know data.data is an array
    let base64Images: string[] = [];
    
    // The frontend expects: json.data is an array of { base64: string, has_nsfw: boolean }
    if (data.data && Array.isArray(data.data)) {
      base64Images = data.data
        .map((item: any) => item.base64)
        .filter((base64: any): base64 is string => 
          base64 && typeof base64 === 'string' && base64.length > 0
        );
    } else {
      // If not in data.data, try other possible locations
      console.log("Searching for base64 in response...", Object.keys(data));
      
      // Try to find base64 anywhere in the response
      const findBase64 = (obj: any): string[] => {
        const results: string[] = [];
        if (!obj || typeof obj !== 'object') return results;
        
        if (obj.base64 && typeof obj.base64 === 'string') {
          results.push(obj.base64);
        }
        
        if (Array.isArray(obj)) {
          obj.forEach(item => results.push(...findBase64(item)));
        } else {
          Object.values(obj).forEach(value => {
            if (value && typeof value === 'object') {
              results.push(...findBase64(value));
            }
          });
        }
        return results;
      };
      
      base64Images = findBase64(data);
    }

    // Create data URLs for storage (same as frontend)
    const imageDataUrls = base64Images.map(base64 => 
      `data:image/png;base64,${base64}`
    );

    // Save to database - store the data URLs
    try {
      
      const newImage:insertImage={
        id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        userId: userId,
        prompt: parsed.data.prompt,
        imageUrls: imageDataUrls, // Store data:image/png;base64,... URLs

      }
      await db.insert(imagesTable).values(newImage);
      console.log(`✅ Saved ${imageDataUrls.length} image(s) to database`);
    } catch (dbError: any) {
      console.error("Error saving to database:", dbError);
      // Check if it's the foreign key error
      if (dbError.code === '23503') {
        console.error("Foreign key error - user might not exist in database");
      }
    }
    
    //increment count for user
  await incrementUserGenerationCount(userId, parsed.data.num_images);

    // Return the exact structure the frontend expects
    return NextResponse.json({
      ...data, // Keep original Freepik response
      savedToDatabase: true,
      imageCount: base64Images.length,
    });

  } catch (e: any) {
    console.error("Unexpected error:", e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}