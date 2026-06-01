import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../lib/db';
import { adminSettingsTable } from '@workspace/db';
import { eq } from 'drizzle-orm';

export async function requireAdminPin(req: Request, res: Response, next: NextFunction) {
  try {
    const pin = req.headers['x-admin-pin'] as string | undefined;
    if (!pin) return res.status(401).json({ error: 'Admin PIN required in x-admin-pin header' });

    const record = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, 'admin_pin')).limit(1);
    if (!record.length) return res.status(403).json({ error: 'Admin PIN not configured. Set it via POST /api/admin/set-pin' });

    const valid = await bcrypt.compare(pin, record[0].value);
    if (!valid) return res.status(401).json({ error: 'Invalid admin PIN' });
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify admin PIN' });
  }
}
