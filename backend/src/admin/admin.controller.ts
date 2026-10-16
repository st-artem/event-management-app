import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Request as Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import * as yup from 'yup';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../auth/admin.guard';
import { YupValidationPipe } from '../common/pipes/yup-validation.pipe';

const updateRoleSchema = yup.object({
  role: yup.string().oneOf(['user', 'admin'], 'Role must be user or admin').required('Role is required'),
});

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  findAllUsers() {
    return this.adminService.findAllUsers();
  }

  @Get('events')
  @ApiOperation({ summary: 'Get all events, including private' })
  findAllEvents() {
    return this.adminService.findAllEvents();
  }

  @Patch('users/:id/role')
  @ApiOperation({ summary: 'Change user role' })
  @ApiBody({ schema: { type: 'object', properties: { role: { type: 'string', example: 'admin' } } } })
  updateUserRole(
    @Param('id', ParseIntPipe) id: number,
    @Body(new YupValidationPipe(updateRoleSchema)) body: { role: 'user' | 'admin' },
    @Req() req: any,
  ) {
    return this.adminService.updateUserRole(id, body.role, req.user.sub);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user and their events' })
  removeUser(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.adminService.removeUser(id, req.user.sub);
  }
}
