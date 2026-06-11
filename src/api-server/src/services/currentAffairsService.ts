import { db } from "../lib/db";
import { eq, desc } from "drizzle-orm";
import { currentAffairsTable } from "@workspace/db";

function slugifyTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

export const getCurrentAffairs = async () => {
  return await db
    .select()
    .from(currentAffairsTable)
    .orderBy(desc(currentAffairsTable.publishedAt));
};

export const getCurrentAffairById = async (slug: string) => {
  const normalized = slugifyTitle(slug);

  // Try UUID match first
  const [article] = await db
    .select()
    .from(currentAffairsTable)
    .where(eq(currentAffairsTable.slug, slug))
    .limit(1);

  if (article) return article;

  // Fall back to slug match
  const allCurrentAffairs = await db
    .select()
    .from(currentAffairsTable)
    .orderBy(desc(currentAffairsTable.publishedAt));

  return allCurrentAffairs.find((a) => slugifyTitle(a.title) === normalized);
};


