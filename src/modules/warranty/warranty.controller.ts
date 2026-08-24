import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../models/req.model';
import { EncryptedWarrantyClaim } from './warranty.model';
import { submitClaimSchema } from './warranty.validation';
import { logger } from '../../config/logger';

/**
 * POST /api/warranty/claim
 * Saves a zero-knowledge encrypted warranty payload. The request body must
 * contain ONLY ciphertext + key-wrapping metadata — see submitClaimSchema.
 * This handler never sees, logs, or derives plaintext claim details.
 */
export const submitClaim = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error, value } = submitClaimSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    const claim = await EncryptedWarrantyClaim.create({
      ...value,
      userId: req.user.id,
    });

    // Deliberately do not log any field from `value` — even though it's
    // ciphertext, logging it at scale is unnecessary exposure surface.
    logger.info('Warranty claim submitted', { claimId: claim._id, userId: req.user.id });

    return res.status(201).json({
      message: 'Warranty claim submitted successfully',
      data: {
        id: claim._id,
        status: claim.status,
        createdAt: claim.get('createdAt'),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/warranty/claims
 * Returns the current user's own encrypted claims (still fully opaque —
 * decryption happens client-side with the user's passphrase, see
 * lib/crypto.ts on the frontend).
 */
export const getClaims = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const query = { userId: req.user.id };

    const total = await EncryptedWarrantyClaim.countDocuments(query);
    const claims = await EncryptedWarrantyClaim.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      data: claims,
      total,
      page,
      limit,
    });
  } catch (err) {
    next(err);
  }
};
