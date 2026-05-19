import type { Request as ExpressRequest } from 'express';
import type { JwtPayload } from './auth/decorators/current-user.decorator';

export interface RequestWithUser extends ExpressRequest {
  user?: JwtPayload;
}
