import express from 'express';
import { query, queryOne, queryAll, transaction } from '../db/pool.js';
import { AppError } from '../middleware/errorHandler.js';
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

const allowedTypes = ['shelter', 'rescue', 'supply_point', 'health', 'incident', 'damage', 'supply_request', 'help_needed'];
const allowedSeverity = ['low', 'medium', 'high', 'critical'];
const allowedRecordKinds = ['place', 'report'];
const allowedPlaceTypes = ['shelter', 'rescue', 'supply_point', 'health', 'incident'];
const allowedReportTypes = ['persona_atrapada', 'persona_desaparecida', 'persona_herida', 'dano_estructural', 'via_bloqueada', 'incendio', 'inundacion', 'emergencia_medica', 'necesidad', 'otra'];

function validatePinData(req, res, next) {
  const { location, type, severity, record_kind = 'place', place_type, report_type } = req.body;
  const hasCoordinates = location && typeof location.lat === 'number' && typeof location.lng === 'number';
  if (!hasCoordinates && !req.body?.metadata?.direccion) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Indica una dirección o proporciona latitud y longitud.' });
  }
  if (hasCoordinates && (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180)) {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Las coordenadas están fuera de rango.' });
  }
  if (!allowedTypes.includes(type)) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'El tipo de registro no es válido.' });
  if (!allowedRecordKinds.includes(record_kind)) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'La clase de registro no es válida.' });
  if (record_kind === 'place' && (!place_type || !allowedPlaceTypes.includes(place_type))) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'El tipo de lugar no es válido.' });
  if (record_kind === 'report' && !allowedReportTypes.includes(report_type)) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'El tipo de reporte no es válido.' });
  if (!allowedSeverity.includes(severity)) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Nivel de urgencia no válido.' });
  next();
}

function formatPinResponse(pin) {
  let lat = null;
  let lng = null;
  if (pin.location) {
    if (typeof pin.location === 'string') {
      const match = pin.location.match(/POINT\(([-\d.]+)\s+([-\d.]+)\)/);
      if (match) { lng = Number(match[1]); lat = Number(match[2]); }
    } else if (pin.location.coordinates) {
      lng = Number(pin.location.coordinates[0]); lat = Number(pin.location.coordinates[1]);
    }
  }
  return {
    id: pin.id,
    type: pin.pin_type,
    record_kind: pin.record_kind || 'place',
    place_type: pin.place_type || null,
    report_type: pin.report_type || null,
    location: { lat, lng },
    severity: pin.severity,
    status: pin.status,
    verification_status: pin.verification_status || 'unverified',
    description: pin.description,
    metadata: pin.metadata || {},
    photo_url: pin.photo_url,
    is_private: pin.is_private,
    creator_id: pin.creator_id,
    verified_by: pin.verified_by,
    created_at: pin.created_at,
    updated_at: pin.updated_at,
  };
}

// Public: anyone can register an emergency place/report.
router.post('/', validatePinData, async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { location, type, severity, description, photo_url, is_private = false, metadata = {}, record_kind = 'place', place_type = null, report_type = null } = req.body;
    const needs = Array.isArray(metadata.necesidades) ? metadata.necesidades : [];
    const hasCoordinates = location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng));
    const geoLocation = hasCoordinates
      ? `SRID=4326;POINT(${Number(location.lng)} ${Number(location.lat)})`
      : null;

    const result = await transaction(async (client) => {
      const pin = (await client.query(
        `INSERT INTO resilio_schema.pins
          (creator_id, pin_type, record_kind, place_type, report_type, location, severity, status, description, photo_url, is_private, metadata, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CASE WHEN $6::text IS NULL THEN NULL ELSE ST_GeogFromText($6) END, $7, 'reported', $8, $9, $10, $11::jsonb, NOW(), NOW())
         RETURNING id, creator_id, pin_type, record_kind, place_type, report_type, location, severity, status, description, photo_url, is_private, metadata, verification_status, verified_by, created_at, updated_at`,
        [userId, type, record_kind, place_type, report_type, geoLocation, severity, description || '', photo_url || null, Boolean(is_private), JSON.stringify(metadata)]
      )).rows[0];

      for (const need of needs) {
        const required = Number(need.cantidadRequerida) || 0;
        const covered = Math.min(Number(need.cantidadCubierta) || 0, required);
        await client.query(
          `INSERT INTO resilio_schema.supply_requests
            (pin_id, item_category, item_name, quantity_needed, quantity_fulfilled, unit, urgency_level, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
          [pin.id, report_type || place_type || type, String(need.item || '').trim(), required, covered, need.unidad || 'unidades', severity]
        );
      }
      return pin;
    });

    console.log(`[PIN_SUCCESS] Public pin created: pin_id=${result.id}, creator_id=${userId || 'anonymous'}`);
    res.status(201).json({ message: 'Registro creado exitosamente. La información quedó no verificada.', pin: formatPinResponse(result) });
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const { type, severity, status, record_kind, place_type, report_type, limit = 100, offset = 0 } = req.query;
    const conditions = ['is_private = false']; const values = []; let index = 1;
    if (type) { conditions.push(`pin_type = $${index++}`); values.push(type); }
    if (severity) { conditions.push(`severity = $${index++}`); values.push(severity); }
    if (status) { conditions.push(`status = $${index++}`); values.push(status); }
    if (record_kind) { conditions.push(`record_kind = $${index++}`); values.push(record_kind); }
    if (place_type) { conditions.push(`place_type = $${index++}`); values.push(place_type); }
    if (report_type) { conditions.push(`report_type = $${index++}`); values.push(report_type); }
    const where = conditions.join(' AND ');
    const total = await queryOne(`SELECT COUNT(*)::int AS total FROM resilio_schema.pins WHERE ${where}`, values);
    const pins = await queryAll(
      `SELECT id, creator_id, pin_type, record_kind, place_type, report_type, location, severity, status, description, photo_url, is_private, metadata, verification_status, verified_by, created_at, updated_at
       FROM resilio_schema.pins WHERE ${where} ORDER BY created_at DESC LIMIT $${index} OFFSET $${index + 1}`,
      [...values, Number(limit), Number(offset)]
    );
    res.json({ pins: pins.map(formatPinResponse), pagination: { total: total.total, limit: Number(limit), offset: Number(offset) } });
  } catch (error) { next(error); }
});

router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, radius = 5, limit = 50, offset = 0 } = req.query;
    if (lat === undefined || lng === undefined) return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'lat y lng son requeridos.' });
    const point = `SRID=4326;POINT(${Number(lng)} ${Number(lat)})`;
    const pins = await queryAll(
      `SELECT id, creator_id, pin_type, record_kind, place_type, report_type, location, severity, status, description, photo_url, is_private, metadata, verification_status, verified_by, created_at, updated_at
       FROM resilio_schema.pins WHERE is_private = false
       AND ST_DWithin(location, ST_GeogFromText($1), $2)
       ORDER BY location <-> ST_GeogFromText($1) LIMIT $3 OFFSET $4`,
      [point, Number(radius) * 1000, Number(limit), Number(offset)]
    );
    res.json({ pins: pins.map(formatPinResponse), pagination: { total: pins.length, limit: Number(limit), offset: Number(offset) } });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const pin = await queryOne(
      `SELECT id, creator_id, pin_type, record_kind, place_type, report_type, location, severity, status, description, photo_url, is_private, metadata, verification_status, verified_by, created_at, updated_at
       FROM resilio_schema.pins WHERE id = $1`, [req.params.id]
    );
    if (!pin) return res.status(404).json({ error: 'PIN_NOT_FOUND', message: 'Lugar no encontrado.' });
    res.json({ pin: formatPinResponse(pin) });
  } catch (error) { next(error); }
});

// Public edit: anyone may update a pin. Verification is handled separately by /:id/review. Any edit resets verification.
router.patch('/:id', async (req, res, next) => {
  try {
    const current = await queryOne(`SELECT id, creator_id, pin_type, record_kind, place_type, report_type, severity, status, location, metadata FROM resilio_schema.pins WHERE id = $1`, [req.params.id]);
    if (!current) return res.status(404).json({ error: 'PIN_NOT_FOUND', message: 'Lugar o reporte no encontrado.' });

    // La edición es pública. Toda modificación reinicia la verificación.
    const { location, type, severity, description, metadata, status, record_kind, place_type, report_type } = req.body;
    const effectiveMetadata = metadata !== undefined ? metadata : (current.metadata || {});
    const effectiveHasCoordinates = location !== undefined
      ? Boolean(location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng)))
      : Boolean(current.location);
    const effectiveAddress = String(effectiveMetadata.direccion || '').trim();
    if (!effectiveHasCoordinates && !effectiveAddress) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'La información debe conservar una dirección o una ubicación GPS.' });
    }
    const effectiveKind = record_kind !== undefined ? record_kind : current.record_kind;
    const effectiveReportType = report_type !== undefined ? report_type : current.report_type;
    if (!allowedRecordKinds.includes(effectiveKind)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'La clase de registro no es válida.' });
    }
    if (effectiveKind === 'place' && place_type !== undefined && !allowedPlaceTypes.includes(place_type)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'El tipo de lugar no es válido.' });
    }
    if (effectiveKind === 'report' && !allowedReportTypes.includes(effectiveReportType)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'El tipo de reporte no es válido.' });
    }
    if (type !== undefined && !allowedTypes.includes(type)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'El tipo de registro no es válido.' });
    }
    if (severity !== undefined && !allowedSeverity.includes(severity)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'El nivel de urgencia no es válido.' });
    }
    if (location && effectiveHasCoordinates && (Number(location.lat) < -90 || Number(location.lat) > 90 || Number(location.lng) < -180 || Number(location.lng) > 180)) {
      return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Las coordenadas están fuera de rango.' });
    }
    const fields = []; const values = []; let i = 1;
    if (record_kind !== undefined) { fields.push(`record_kind = $${i++}`); values.push(record_kind); }
    if (place_type !== undefined) { fields.push(`place_type = $${i++}`); values.push(place_type); }
    if (report_type !== undefined) { fields.push(`report_type = $${i++}`); values.push(report_type); }
    const hasCoordinates = location && Number.isFinite(Number(location.lat)) && Number.isFinite(Number(location.lng));
    if (hasCoordinates) {
      fields.push(`location = ST_GeogFromText($${i++})`);
      values.push(`SRID=4326;POINT(${Number(location.lng)} ${Number(location.lat)})`);
    } else if (location === null) {
      fields.push('location = NULL');
    }
    if (type !== undefined) { fields.push(`pin_type = $${i++}`); values.push(type); }
    if (severity !== undefined) { fields.push(`severity = $${i++}`); values.push(severity); }
    if (description !== undefined) { fields.push(`description = $${i++}`); values.push(description); }
    if (metadata !== undefined) { fields.push(`metadata = $${i++}::jsonb`); values.push(JSON.stringify(metadata)); }
    if (status !== undefined && ['reported','verified','in_progress','resolved'].includes(status)) { fields.push(`status = $${i++}`); values.push(status); }
    fields.push(`verification_status = 'unverified'`);
    fields.push('verified_by = NULL');
    fields.push('updated_at = NOW()');
    values.push(req.params.id);
    const updated = await transaction(async (client) => {
      const row = (await client.query(
        `UPDATE resilio_schema.pins SET ${fields.join(', ')} WHERE id = $${i}
         RETURNING id, creator_id, pin_type, record_kind, place_type, report_type, location, severity, status, description, photo_url, is_private, metadata, verification_status, verified_by, created_at, updated_at`, values
      )).rows[0];

      if (metadata !== undefined && Array.isArray(metadata.necesidades)) {
        await client.query(`DELETE FROM resilio_schema.supply_requests WHERE pin_id = $1`, [req.params.id]);
        for (const need of metadata.necesidades) {
          const required = Number(need.cantidadRequerida) || 0;
          const covered = Math.min(Number(need.cantidadCubierta) || 0, required);
          await client.query(
            `INSERT INTO resilio_schema.supply_requests
              (pin_id, item_category, item_name, quantity_needed, quantity_fulfilled, unit, urgency_level, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
            [req.params.id, row.report_type || row.place_type || row.pin_type, String(need.item || '').trim(), required, covered, need.unidad || 'unidades', row.severity]
          );
        }
      }
      return row;
    });
    res.json({ pin: formatPinResponse(updated) });
  } catch (error) { next(error); }
});

// Verification requires an authenticated account; editing remains public.
router.patch('/:id/review', verifyJWT, async (req, res, next) => {
  try {
    // Verificar sí requiere una cuenta. Cualquier usuario autenticado puede revisar y verificar.
    if (!req.user?.id) {
      return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Debes iniciar sesión para verificar información.' });
    }
    const approved = Boolean(req.body.approved);
    const updated = await queryOne(
      `UPDATE resilio_schema.pins SET verification_status = $1, verified_by = $2, updated_at = NOW() WHERE id = $3
       RETURNING id, creator_id, pin_type, record_kind, place_type, report_type, location, severity, status, description, photo_url, is_private, metadata, verification_status, verified_by, created_at, updated_at`,
      [approved ? 'verified' : 'unverified', req.user.id, req.params.id]
    );
    if (!updated) return res.status(404).json({ error: 'PIN_NOT_FOUND', message: 'Lugar o reporte no encontrado.' });
    res.json({ pin: formatPinResponse(updated) });
  } catch (error) { next(error); }
});

router.delete('/:id', verifyJWT, async (req, res, next) => {
  try {
    const pin = await queryOne(`SELECT id, creator_id, status FROM resilio_schema.pins WHERE id = $1`, [req.params.id]);
    if (!pin) return res.status(404).json({ error: 'PIN_NOT_FOUND', message: 'Lugar no encontrado.' });
    const allowed = pin.creator_id === req.user.id || ['coordinator','admin'].includes(req.user.role);
    if (!allowed) return res.status(403).json({ error: 'PERMISSION_DENIED', message: 'No tienes permiso para eliminar este lugar.' });
    await query(`DELETE FROM resilio_schema.pins WHERE id = $1`, [req.params.id]);
    res.json({ message: 'Lugar eliminado.' });
  } catch (error) { next(error); }
});

export default router;
