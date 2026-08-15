import express from 'express';
import { query, queryOne, queryAll } from '../db/pool.js';
import { AppError } from '../middleware/errorHandler.js';
import { verifyJWT } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rate limiting store: track requests per user
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 1000; // 1 second
const RATE_LIMIT_MAX_REQUESTS = 1; // Max 1 request per second per user

/**
 * Rate limiting middleware for sync endpoints
 */
const rateLimitSync = (req, res, next) => {
  const userId = req.user?.id || req.ip;
  const now = Date.now();
  
  if (!rateLimitMap.has(userId)) {
    rateLimitMap.set(userId, []);
  }
  
  const requests = rateLimitMap.get(userId);
  // Remove old requests outside the window
  const recentRequests = requests.filter(t => now - t < RATE_LIMIT_WINDOW);
  
  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    console.log(`[SYNC_RATE_LIMIT] User ${userId} exceeded rate limit`);
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes de sincronización. Intenta más tarde.',
      message_en: 'Too many sync requests. Try again later.',
      retry_after: RATE_LIMIT_WINDOW / 1000
    });
  }
  
  recentRequests.push(now);
  rateLimitMap.set(userId, recentRequests);
  
  next();
};

/**
 * GET /api/sync
 * Get all changes (pins, supply_requests, volunteer_assignments) since a timestamp
 * Query params: ?since=<ISO8601_timestamp>&limit=100
 * Returns: { pins, supply_requests, volunteer_assignments, deletions, server_timestamp }
 */
router.get('/', verifyJWT, rateLimitSync, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { since, limit = 100 } = req.query;
    const sinceTimestamp = since ? new Date(since).toISOString() : '1970-01-01T00:00:00Z';

    console.log(`[SYNC] User ${userId} requesting sync since ${sinceTimestamp}`);

    // Fetch pins updated since timestamp (only public pins and user's private pins)
    const pins = await queryAll(
      `SELECT * FROM resilio_schema.pins 
       WHERE (is_private = false OR creator_id = $1) AND updated_at > $2
       LIMIT $3`,
      [userId, sinceTimestamp, parseInt(limit)]
    );

    // Fetch supply requests (through accessible pins)
    const supplyRequests = await queryAll(
      `SELECT sr.* FROM resilio_schema.supply_requests sr
       WHERE sr.updated_at > $1
       LIMIT $2`,
      [sinceTimestamp, parseInt(limit)]
    );

    // Fetch volunteer assignments
    const volunteerAssignments = await queryAll(
      `SELECT * FROM resilio_schema.volunteer_assignments 
       WHERE updated_at > $1
       LIMIT $2`,
      [sinceTimestamp, parseInt(limit)]
    );

    // Fetch deletions: pins deleted since timestamp
    // For MVP, we'll track deletions in a simple way using soft deletes or a deletion log
    const deletions = []; // TODO: Implement deletion tracking table

    const serverTimestamp = new Date().toISOString();

    console.log(`[SYNC_SUCCESS] User ${userId} sync: ${pins.length} pins, ${supplyRequests.length} supplies, ${volunteerAssignments.length} volunteers`);

    res.json({
      message: 'Cambios obtenidos exitosamente',
      message_en: 'Changes retrieved successfully',
      pins: formatPinsForSync(pins),
      supply_requests: supplyRequests,
      volunteer_assignments: volunteerAssignments,
      deletions: deletions,
      server_timestamp: serverTimestamp
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/sync
 * Accept batch of changes from client and process them
 * Body: { pins: [...], supply_requests: [...], volunteer_assignments: [...] }
 * Returns: { success: true, synced_ids: {...}, conflicts: [...] }
 */
router.post('/', verifyJWT, rateLimitSync, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { pins = [], supply_requests = [], volunteer_assignments = [] } = req.body;

    console.log(`[SYNC] User ${userId} uploading: ${pins.length} pins, ${supply_requests.length} supplies, ${volunteer_assignments.length} volunteers`);

    const syncedIds = {
      pins: [],
      supply_requests: [],
      volunteer_assignments: []
    };
    const conflicts = [];

    // Process pins
    for (const pin of pins) {
      try {
        const tempUuid = pin.id; // Client-generated temp UUID
        
        // Check if this is an offline-created pin (temp_uuid)
        const isOfflineCreated = typeof tempUuid === 'string' && tempUuid.startsWith('temp_');

        if (isOfflineCreated) {
          // Check for duplicate (idempotency)
          const existingPin = await queryOne(
            `SELECT id FROM resilio_schema.pins WHERE id = $1`,
            [tempUuid]
          );

          if (existingPin) {
            // Already synced, return existing UUID
            syncedIds.pins.push({
              temp_uuid: tempUuid,
              real_uuid: existingPin.id
            });
            continue;
          }

          // Generate real UUID
          const realUuid = generateUUID();
          
          // Insert pin with real UUID
          const newPin = await queryOne(
            `INSERT INTO resilio_schema.pins 
             (id, creator_id, pin_type, location, severity, status, description, photo_url, is_private, created_at, updated_at)
             VALUES ($1, $2, $3, ST_GeomFromText('POINT(0 0)', 4326), $4, $5, $6, $7, $8, $9, NOW())
             RETURNING id`,
            [
              realUuid,
              pin.creator_id || userId,
              pin.type || pin.pin_type,
              pin.severity,
              pin.status || 'reported',
              pin.description,
              pin.photo_url,
              pin.is_private || false,
              pin.created_at || new Date().toISOString()
            ]
          );

          if (!newPin) {
            console.log(`[SYNC_ERROR] Failed to insert pin`);
            conflicts.push({
              id: tempUuid,
              type: 'pin',
              reason: 'INSERT_FAILED'
            });
          } else {
            syncedIds.pins.push({
              temp_uuid: tempUuid,
              real_uuid: realUuid
            });
          }
        } else {
          // Update existing pin
          const currentPin = await queryOne(
            `SELECT updated_at FROM resilio_schema.pins WHERE id = $1`,
            [tempUuid]
          );

          if (currentPin && new Date(currentPin.updated_at) > new Date(pin.updated_at)) {
            // Server version is newer, report conflict
            conflicts.push({
              id: tempUuid,
              type: 'pin',
              reason: 'CONFLICT_NEWER_VERSION',
              server_updated_at: currentPin.updated_at,
              client_updated_at: pin.updated_at
            });
            continue;
          }

          await query(
            `UPDATE resilio_schema.pins SET pin_type = $1, severity = $2, status = $3, description = $4, photo_url = $5, updated_at = NOW() WHERE id = $6`,
            [pin.type || pin.pin_type, pin.severity, pin.status, pin.description, pin.photo_url, tempUuid]
          );

          syncedIds.pins.push({ id: tempUuid, synced: true });
        }
      } catch (error) {
        console.log(`[SYNC_ERROR] Error processing pin: ${error.message}`);
        conflicts.push({
          type: 'pin',
          reason: 'PROCESSING_ERROR',
          error: error.message
        });
      }
    }

    // Process supply requests
    for (const supply of supply_requests) {
      try {
        const tempUuid = supply.id;
        const isOfflineCreated = typeof tempUuid === 'string' && tempUuid.startsWith('temp_');

        if (isOfflineCreated) {
          const realUuid = generateUUID();
          const supplyResult = await queryOne(
            `INSERT INTO resilio_schema.supply_requests 
             (id, pin_id, item_category, item_name, quantity_needed, quantity_fulfilled, unit, urgency_level, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
             RETURNING id`,
            [
              realUuid,
              supply.pin_id,
              supply.item_category,
              supply.item_name,
              supply.quantity_needed,
              supply.quantity_fulfilled || 0,
              supply.unit,
              supply.urgency_level,
              supply.created_at || new Date().toISOString()
            ]
          );

          if (!supplyResult) {
            conflicts.push({
              id: tempUuid,
              type: 'supply_request',
              reason: 'INSERT_FAILED'
            });
          } else {
            syncedIds.supply_requests.push({
              temp_uuid: tempUuid,
              real_uuid: realUuid
            });
          }
        } else {
          const current = await queryOne(
            `SELECT updated_at FROM resilio_schema.supply_requests WHERE id = $1`,
            [tempUuid]
          );

          if (current && new Date(current.updated_at) > new Date(supply.updated_at)) {
            conflicts.push({
              id: tempUuid,
              type: 'supply_request',
              reason: 'CONFLICT_NEWER_VERSION'
            });
            continue;
          }

          await query(
            `UPDATE resilio_schema.supply_requests SET quantity_fulfilled = $1, updated_at = NOW() WHERE id = $2`,
            [supply.quantity_fulfilled, tempUuid]
          );

          syncedIds.supply_requests.push({ id: tempUuid, synced: true });
        }
      } catch (error) {
        conflicts.push({
          type: 'supply_request',
          reason: 'PROCESSING_ERROR',
          error: error.message
        });
      }
    }

    // Process volunteer assignments similarly
    for (const assignment of volunteer_assignments) {
      try {
        const tempUuid = assignment.id;
        const isOfflineCreated = typeof tempUuid === 'string' && tempUuid.startsWith('temp_');

        if (isOfflineCreated) {
          const realUuid = generateUUID();
          const assignmentResult = await queryOne(
            `INSERT INTO resilio_schema.volunteer_assignments 
             (id, volunteer_id, pin_id, status, start_time, end_time, skills_offered, hours_committed, notes, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
             RETURNING id`,
            [
              realUuid,
              assignment.volunteer_id,
              assignment.pin_id,
              assignment.status || 'pending',
              assignment.start_time,
              assignment.end_time,
              assignment.skills_offered,
              assignment.hours_committed,
              assignment.notes,
              assignment.created_at || new Date().toISOString()
            ]
          );

          if (!assignmentResult) {
            conflicts.push({
              id: tempUuid,
              type: 'volunteer_assignment',
              reason: 'INSERT_FAILED'
            });
          } else {
            syncedIds.volunteer_assignments.push({
              temp_uuid: tempUuid,
              real_uuid: realUuid
            });
          }
        } else {
          await query(
            `UPDATE resilio_schema.volunteer_assignments SET status = $1, updated_at = NOW() WHERE id = $2`,
            [assignment.status, tempUuid]
          );

          syncedIds.volunteer_assignments.push({ id: tempUuid, synced: true });
        }
      } catch (error) {
        conflicts.push({
          type: 'volunteer_assignment',
          reason: 'PROCESSING_ERROR'
        });
      }
    }

    console.log(`[SYNC_SUCCESS] User ${userId} sync completed: conflicts=${conflicts.length}`);

    res.json({
      success: true,
      message: 'Cambios sincronizados exitosamente',
      message_en: 'Changes synced successfully',
      synced_ids: syncedIds,
      conflicts: conflicts,
      server_timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Helper function to generate UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Format pins for sync response
 */
function formatPinsForSync(pins) {
  return pins.map(pin => ({
    id: pin.id,
    type: pin.pin_type,
    location: pin.location,
    severity: pin.severity,
    status: pin.status,
    description: pin.description,
    photo_url: pin.photo_url,
    is_private: pin.is_private,
    creator_id: pin.creator_id,
    verified_by: pin.verified_by,
    created_at: pin.created_at,
    updated_at: pin.updated_at
  }));
}

export default router;
