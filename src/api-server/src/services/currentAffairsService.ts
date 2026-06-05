import { db } from "../lib/db";
import { eq } from "drizzle-orm";
import { currentAffair } from "@workspace/db";

export const getCurrentAffairs = async () => {
  return await db.select().from(currentAffair).orderBy(currentAffair.date);
};

export const getCurrentAffairById = async (id: string) => {
  const result = await db
    .select()
    .from(currentAffair)
    .where(eq(currentAffair.id, id));
  return result[0];
};

export const createCurrentAffair = async (data: {
  title: string;
  content: string;
  date: Date;
}) => {
  const [newCurrentAffair] = await db
    .insert(currentAffair)
    .values({
      title: data.title,
      content: data.content,
      date: data.date,
    })
    .returning();

  return newCurrentAffair;
};

export const updateCurrentAffair = async (
  id: string,
  data: { title: string; content: string; date: Date },
) => {
  const [updatedCurrentAffair] = await db
    .update(currentAffair)
    .set({
      title: data.title,
      content: data.content,
      date: data.date,
    })
    .where(eq(currentAffair.id, id))
    .returning();

  return updatedCurrentAffair;
};

export const deleteCurrentAffair = async (id: string) => {
  const [deletedCurrentAffair] = await db
    .delete(currentAffair)
    .where(eq(currentAffair.id, id))
    .returning();

  return deletedCurrentAffair;
};
