import 'dotenv/config';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-http';

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);

  // 🔥 FULL RESET (Neon-safe)
  await db.execute(sql`DROP SCHEMA IF EXISTS public CASCADE`);
  await db.execute(sql`CREATE SCHEMA public`);
  await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

  console.log('🔥 Database fully reset (tables, relations, everything)');
}

main().catch(console.error);
