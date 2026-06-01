import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { db } from '../lib/db';
import { adminSettingsTable } from '@workspace/db';
import { eq } from 'drizzle-orm';

const router = Router();
const pinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/document-admin/verify-pin
router.post('/verify-pin', pinLimiter, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin || typeof pin !== 'string' || pin.length < 4)
      return res.status(400).json({ error: 'PIN must be at least 4 characters' });

    const record = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, 'admin_pin')).limit(1);
    if (!record.length)
      return res.status(404).json({ error: 'Admin PIN not set. Use POST /api/document-admin/set-pin to create one.' });

    const valid = await bcrypt.compare(pin, record[0].value);
    if (!valid) return res.status(401).json({ error: 'Invalid PIN' });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify PIN' });
  }
});

// POST /api/document-admin/set-pin
router.post('/set-pin', pinLimiter, async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;
    if (!newPin || typeof newPin !== 'string' || newPin.length < 4)
      return res.status(400).json({ error: 'New PIN must be at least 4 characters' });

    const existing = await db.select().from(adminSettingsTable).where(eq(adminSettingsTable.key, 'admin_pin')).limit(1);
    if (existing.length) {
      if (!currentPin) return res.status(400).json({ error: 'Current PIN required to change PIN' });
      const valid = await bcrypt.compare(currentPin, existing[0].value);
      if (!valid) return res.status(401).json({ error: 'Current PIN is incorrect' });
    }

    const hashed = await bcrypt.hash(newPin, 12);
    if (existing.length) {
      await db.update(adminSettingsTable).set({ value: hashed, updatedAt: new Date() }).where(eq(adminSettingsTable.key, 'admin_pin'));
    } else {
      await db.insert(adminSettingsTable).values({ key: 'admin_pin', value: hashed });
    }
    res.json({ success: true, message: 'PIN updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update PIN' });
  }
});

export default router;
