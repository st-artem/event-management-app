import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

// Використовується після JwtAuthGuard, який кладе payload токена в request.user
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    if (request.user?.role !== 'admin') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
