import { Controller, Get, Patch, Param, UseGuards, Headers, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  @Roles(Role.CITIZEN, Role.OFFICER, Role.SUPERVISOR, Role.GRIEVANCE, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get all notifications for current user' })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  findMy(@Headers('x-user-id') userId: string) {
    return {
      success: true,
      data: this.notificationsService.findByUser(userId),
      message: 'OK'
    };
  }

  @Post()
  @Roles(Role.OFFICER, Role.SUPERVISOR, Role.GRIEVANCE, Role.SUPER_USER)
  @ApiOperation({ summary: 'Create a manual notification' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 201, description: 'Notification created' })
  createNotification(@Body() data: any) {
    return {
      success: true,
      data: this.notificationsService.createNotification(data),
      message: 'Created'
    };
  }

  @Get('count')
  @Roles(Role.CITIZEN, Role.OFFICER, Role.SUPERVISOR, Role.GRIEVANCE, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Unread count' })
  getCount(@Headers('x-user-id') userId: string) {
    return {
      success: true,
      data: { count: this.notificationsService.getCount(userId) },
      message: 'OK'
    };
  }

  @Patch('read-all')
  @Roles(Role.CITIZEN, Role.OFFICER, Role.SUPERVISOR, Role.GRIEVANCE, Role.SUPER_USER)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'All marked as read' })
  markAllAsRead(@Headers('x-user-id') userId: string) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Patch(':id/read')
  @Roles(Role.CITIZEN, Role.OFFICER, Role.SUPERVISOR, Role.GRIEVANCE, Role.SUPER_USER)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(@Param('id') id: string) {
    return {
      success: true,
      data: this.notificationsService.markAsRead(id),
      message: 'OK'
    };
  }
}
