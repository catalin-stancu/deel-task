import { NextFunction, Request, Response } from 'express';
import { AuthenticationError } from '../errors';
import { Profile } from '../models/profile.model';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  const profileId = req.get('profile_id');
  if (!profileId) {
    throw new AuthenticationError('Unauthorized');
  }

  const profile = await Profile.findOne({
    where: { id: profileId },
    attributes: ['id', 'type'],
    raw: true
  });

  if (!profile) {
    throw new AuthenticationError('Unauthorized');
  }

  req.profile = profile;

  next();
};
