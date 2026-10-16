import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

const contextWithUser = (user: any) =>
  ({ switchToHttp: () => ({ getRequest: () => ({ user }) }) }) as ExecutionContext;

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  it('should allow admin', () => {
    expect(guard.canActivate(contextWithUser({ sub: 1, role: 'admin' }))).toBe(true);
  });

  it('should forbid regular user', () => {
    expect(() => guard.canActivate(contextWithUser({ sub: 2, role: 'user' }))).toThrow(ForbiddenException);
  });
});
