import { eq, sql } from "drizzle-orm";
import db from "@/index";
import { usersTable } from "@/db/schema";
import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";

// ---------------------------
// 1. Get authenticated user ID
// ---------------------------
export async function getUserId() {
  const { userId } = await auth();
  if (!userId) throw new Error("unauthenticated");
  return userId;
}

// ---------------------------
// 2. Check / create user
// ---------------------------
export async function ensureUserExists(userId: string) {
  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  if (existingUser.length > 0) return existingUser[0];

  // Fetch info from Clerk
  let userEmail = null;
  let userName = `user_${userId.substring(0, 8)}`;

  try {
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    userEmail = clerkUser.emailAddresses[0]?.emailAddress || null;
    userName = clerkUser.firstName && clerkUser.lastName
      ? `${clerkUser.firstName} ${clerkUser.lastName}`.trim()
      : clerkUser.firstName
      ? clerkUser.firstName
      : clerkUser.emailAddresses[0]?.emailAddress?.split("@")[0] || userName;
  } catch (err) {
    console.warn("Clerk fetch failed, using fallback username:", err);
  }

  const newUser = {
    id: userId,
    email: userEmail,
    name: userName,
  };

  await db.insert(usersTable).values(newUser);
  console.log(`✅ Created new user: ${userId}`);

  return newUser;
}

// ---------------------------
// 3. Get user's current generation count
// ---------------------------
export async function getUserGenerationCount(userId: string) {
  const result = await db
    .select({ count: usersTable.count })
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .limit(1);

  return result[0]?.count || 0;
}

// ---------------------------
// 4. Increment user's generation count
// ---------------------------
export async function incrementUserGenerationCount(userId: string, incrementBy = 1) {
  await db
    .update(usersTable)
    .set({ count: sql`${usersTable.count} + ${incrementBy}` })
    .where(eq(usersTable.id, userId));
}

// ---------------------------
// 5. Check subscription feature
// ---------------------------
export async function hasSubscription(feature: string) {
  const { has } = await auth();
  return has({ plan: feature });
}
