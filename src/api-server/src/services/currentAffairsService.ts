import { db } from "../lib/db";
import { eq, desc } from "drizzle-orm";
import { currentAffairsTable } from "@workspace/db";

function slugifyTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const getCurrentAffairs = async () => {
  return await db
    .select()
    .from(currentAffairsTable)
    .orderBy(desc(currentAffairsTable.publishedAt));
};

export const getCurrentAffairById = async (id: string) => {
  const numericId = Number.parseInt(id, 10);
  const isNumericId = Number.isFinite(numericId) && String(numericId) === id.trim();
  const normalized = slugifyTitle(id);

  const allCurrentAffairs = await db
    .select()
    .from(currentAffairsTable)
    .orderBy(desc(currentAffairsTable.publishedAt));

  return allCurrentAffairs.find((article) =>
    isNumericId ? article.id === numericId : slugifyTitle(article.title) === normalized,
  );
};

export const createCurrentAffair = async (data: {
  title: string;
  content: string;
  date: Date;
}) => {
  // Use first 150 characters of content as a fallback for the required summary field
  const summary = data.content ? data.content.substring(0, 150) : "";
  const [newCurrentAffair] = await db
    .insert(currentAffairsTable)
    .values({
      title: data.title,
      summary: summary,
      content: data.content,
      category: "General",
      publishedAt: data.date || new Date(),
    })
    .returning();

  return newCurrentAffair;
};

export const updateCurrentAffair = async (
  id: string,
  data: { title: string; content: string; date: Date },
) => {
  const summary = data.content ? data.content.substring(0, 150) : "";
  const [updatedCurrentAffair] = await db
    .update(currentAffairsTable)
    .set({
      title: data.title,
      summary: summary,
      content: data.content,
      publishedAt: data.date,
    })
    .where(eq(currentAffairsTable.id, parseInt(id, 10)))
    .returning();

  return updatedCurrentAffair;
};

export const deleteCurrentAffair = async (id: string) => {
  const [deletedCurrentAffair] = await db
    .delete(currentAffairsTable)
    .where(eq(currentAffairsTable.id, parseInt(id, 10)))
    .returning();

  return deletedCurrentAffair;
};
