import { NextFunction, Request, Response } from 'express';
import { getProfile, updateProfile, deleteProfile } from './user.service';
import { updateUserSchema } from './user.validation';
import { AuthRequest } from '../../models/req.model';
import { logger } from '../../config/logger';

export const profile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await getProfile(req.user.id);

    logger.info('Profile fetched', {
      userId: req.user.id,
    });

    res.status(200).json({
      message: 'Profile fetched successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const update = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    /**
     * ✅ Validation
     */
    const { error, value } = updateUserSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Validation failed',
        details: error.details.map((d) => d.message),
      });
    }

    const user = await updateProfile(req.user.id, value);

    logger.info('Profile updated (controller)', {
      userId: req.user.id,
    });

    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await deleteProfile(req.user.id);

    logger.info('Profile deleted (controller)', {
      userId: req.user.id,
    });

    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};
