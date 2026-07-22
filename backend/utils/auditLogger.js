import AuditLog from '../models/AuditLog.js';

export const logAdminAction = async (req, action, targetId, targetType, metadata = {}) => {
  try {
    const actorId = req.user?._id;
    const actorUsername = req.user?.username || 'unknown_admin';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

    await AuditLog.create({
      actorId,
      actorUsername,
      action,
      targetId: targetId || undefined,
      targetType: targetType || undefined,
      metadata,
      ipAddress,
    });
  } catch (error) {
    console.error(`Audit logging failed: ${error.message}`);
  }
};
