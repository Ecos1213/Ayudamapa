import express from 'express';
import { query, queryOne, queryAll } from '../db/pool.js';
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { pin_id } = req.query;
    if (!pin_id) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'pin_id es requerido.' });
    const rows = await queryAll(`SELECT * FROM resilio_schema.supply_requests WHERE pin_id = $1 ORDER BY created_at ASC`, [pin_id]);
    res.json({ supply_requests: rows });
  } catch (error) { next(error); }
});

// Public creation is intentional: citizens can report missing resources without an account.
router.post('/', async (req, res, next) => {
  try {
    const { pin_id, item_category = 'other', item_name, quantity_needed, quantity_fulfilled = 0, unit = 'unidades', urgency_level = 'medium' } = req.body;
    if (!pin_id || !item_name || Number(quantity_needed) < 0) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'pin_id, item_name y quantity_needed son requeridos.' });
    const pin = await queryOne(`SELECT id FROM resilio_schema.pins WHERE id = $1`, [pin_id]);
    if (!pin) return res.status(404).json({ error: 'PIN_NOT_FOUND', message: 'Lugar no encontrado.' });
    const row = await queryOne(
      `INSERT INTO resilio_schema.supply_requests (pin_id, item_category, item_name, quantity_needed, quantity_fulfilled, unit, urgency_level, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW(),NOW()) RETURNING *`,
      [pin_id, item_category, item_name.trim(), Number(quantity_needed) || 0, Math.min(Number(quantity_fulfilled) || 0, Number(quantity_needed) || 0), unit, urgency_level]
    );
    res.status(201).json({ supply_request: row });
  } catch (error) { next(error); }
});

router.patch('/:id', verifyJWT, async (req, res, next) => {
  try {
    const row = await queryOne(`SELECT sr.*, p.creator_id FROM resilio_schema.supply_requests sr JOIN resilio_schema.pins p ON p.id=sr.pin_id WHERE sr.id=$1`, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'SUPPLY_NOT_FOUND', message: 'Necesidad no encontrada.' });
    if (row.creator_id !== req.user.id && !['coordinator','admin'].includes(req.user.role)) return res.status(403).json({ error: 'PERMISSION_DENIED', message: 'No tienes permiso para actualizar esta necesidad.' });
    const fulfilled = Math.min(Number(req.body.quantity_fulfilled) || 0, row.quantity_needed);
    const updated = await queryOne(`UPDATE resilio_schema.supply_requests SET quantity_fulfilled=$1, updated_at=NOW() WHERE id=$2 RETURNING *`, [fulfilled, req.params.id]);
    res.json({ supply_request: updated });
  } catch (error) { next(error); }
});

router.delete('/:id', verifyJWT, async (req, res, next) => {
  try {
    const row = await queryOne(`SELECT sr.*, p.creator_id FROM resilio_schema.supply_requests sr JOIN resilio_schema.pins p ON p.id=sr.pin_id WHERE sr.id=$1`, [req.params.id]);
    if (!row) return res.status(404).json({ error: 'SUPPLY_NOT_FOUND', message: 'Necesidad no encontrada.' });
    if (row.creator_id !== req.user.id && !['coordinator','admin'].includes(req.user.role)) return res.status(403).json({ error: 'PERMISSION_DENIED', message: 'No tienes permiso para eliminar esta necesidad.' });
    await query(`DELETE FROM resilio_schema.supply_requests WHERE id=$1`, [req.params.id]);
    res.json({ message: 'Necesidad eliminada.' });
  } catch (error) { next(error); }
});

export default router;
