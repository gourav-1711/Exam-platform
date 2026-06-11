import type { Request, Response, NextFunction } from "express";
import { db } from "../../lib/db";
import { pypPdfsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";

export async function listDocumentPyp(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      year: yearStr,
      examType,
      subject,
      page: pageStr,
      limit: limitStr,
    } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(pageStr, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limitStr, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (yearStr) conditions.push(eq(pypPdfsTable.year, parseInt(yearStr, 10)));
    if (examType) conditions.push(eq(pypPdfsTable.examType, examType));
    if (subject) conditions.push(eq(pypPdfsTable.subject, subject));
    const where = conditions.length ? and(...conditions) : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)` })
      .from(pypPdfsTable)
      .where(where);

    const data = await db
      .select()
      .from(pypPdfsTable)
      .where(where)
      .orderBy(desc(pypPdfsTable.uploadedAt))
      .limit(limitNum)
      .offset(offset);

    res.json({
      data,
      total: Number(countRow?.count ?? 0),
      page: pageNum,
      totalPages: Math.ceil(Number(countRow?.count ?? 0) / limitNum),
    });
  } catch (err) {
    return next(err);
  }
}
