import { Response, NextFunction } from 'express';
import { AuthRequest } from '../models/req.model';
import { User } from '../modules/auth/auth.model';
import { logger } from '../config/logger';

/**
 * requireAdmin
 *
 * Gates a route to users whose stored role is 'ADMIN'.
 *
 * Deliberately does NOT rely on a `role` claim baked into the JWT — the
 * existing access token only ever encodes `{ id }` (see utils/token.ts) and
 * this middleware intentionally does not touch that issuance logic, to keep
 * the existing login/logout flow completely untouched. Instead it does a
 * lightweight DB lookup keyed on `req.user.id`, which `protect` already
 * guarantees is set and verified before this middleware runs.
 *
 * Mount AFTER `protect`:
 *   router.post('/', protect, requireAdmin, asyncHandler(createProduct));
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findById(req.user.id).select('role').lean();

    if (!user || (user as unknown as { role?: string }).role !== 'ADMIN') {
      logger.warn('Forbidden: admin-only route blocked', { userId: req.user.id });
      return res.status(403).json({ message: 'Admin privileges required for this action' });
    }

    next();
  } catch (err) {
    next(err);
  }
};
