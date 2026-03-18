// src/common/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UNAUTHENTICATED_KEY } from '../decorators/unauthenticated.decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if the route is marked as public
    const unAuthenticated = this.reflector.getAllAndOverride<boolean>(
      UNAUTHENTICATED_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (unAuthenticated) {
      return true; // Skip authentication → allow unauthenticated access
    }

    // Otherwise, run normal JWT validation
    return super.canActivate(context);
  }

  // Optional: customize error handling
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}
