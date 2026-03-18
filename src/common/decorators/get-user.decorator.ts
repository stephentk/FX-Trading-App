// src/auth/decorators/get-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/auth/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user; // Populated by JwtAuthGuard

    if (data) {
      return user?.[data]; // e.g., user.id or user.email
    
    }
    return user;
  },
);
