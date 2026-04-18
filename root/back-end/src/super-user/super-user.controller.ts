import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SuperUserService } from './super-user.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('super-user')
@Controller('super-user')
@UseGuards(RolesGuard)
@Roles(Role.SUPER_USER)
export class SuperUserController {
  constructor(private readonly superUserService: SuperUserService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get super-user dashboard statistics' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  getDashboardStats() {
    return {
      success: true,
      data: this.superUserService.getDashboardStats(),
      message: 'OK'
    };
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get system settings' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'System settings retrieved' })
  getSettings() {
    return {
      success: true,
      data: this.superUserService.getSettings(),
      message: 'OK'
    };
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Update system settings' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  updateSettings(@Body() settings: any) {
    return {
      success: true,
      data: this.superUserService.updateSettings(settings),
      message: 'OK'
    };
  }

  @Get('pending-officers')
  @ApiOperation({ summary: 'Get pending officer registrations' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'List of pending officers' })
  getPendingOfficers() {
    return {
      success: true,
      data: this.superUserService.getPendingOfficers(),
      message: 'OK'
    };
  }

  @Post('onboard-officer')
  @ApiOperation({ summary: 'Directly onboard a new officer' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ schema: { type: 'object' } })
  @ApiResponse({ status: 201, description: 'Officer onboarded' })
  onboardOfficer(@Body() data: any) {
    return {
      success: true,
      data: this.superUserService.onboardOfficer(data),
      message: 'OK'
    };
  }

  @Patch('pending-officers/:id/approve')
  @ApiOperation({ summary: 'Approve a pending officer' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Officer approved and onboarded' })
  approvePendingOfficer(@Param('id') id: string) {
    return {
      success: true,
      data: this.superUserService.approvePendingOfficer(id),
      message: 'OK'
    };
  }

  @Patch('pending-officers/:id/reject')
  @ApiOperation({ summary: 'Reject a pending officer' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Officer application rejected' })
  rejectPendingOfficer(@Param('id') id: string) {
    return {
      success: true,
      data: this.superUserService.rejectPendingOfficer(id),
      message: 'OK'
    };
  }
}
