import { Controller, Get, Post, Body, Patch, Param, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody } from '@nestjs/swagger';
import { SupervisorService } from './supervisor.service';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('supervisor')
@Controller('supervisor')
export class SupervisorController {
  constructor(private readonly supervisorService: SupervisorService) {}

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERVISOR)
  @ApiOperation({ summary: 'Get supervisor dashboard statistics' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: false })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved' })
  getDashboardStats(@Headers('x-user-id') userId: string) {
    return {
      success: true,
      data: this.supervisorService.getDashboardStats(userId),
      message: 'OK'
    };
  }

  @Get('escalated')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERVISOR)
  @ApiOperation({ summary: 'Get all escalated applications and grievances' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: false })
  @ApiResponse({ status: 200, description: 'Escalated items retrieved' })
  getEscalated(@Headers('x-user-id') userId: string) {
    return {
      success: true,
      data: this.supervisorService.getEscalated(userId),
      message: 'OK'
    };
  }

  @Get('workload')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERVISOR)
  @ApiOperation({ summary: 'Get workload of all officers' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Officer workload retrieved' })
  getWorkload() {
    return {
      success: true,
      data: this.supervisorService.getWorkload(),
      message: 'OK'
    };
  }

  @Post('assign')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERVISOR)
  @ApiOperation({ summary: 'Assign an application to an officer' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ schema: { type: 'object', properties: { appId: { type: 'string' }, officerId: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Application assigned successfully' })
  assignApplication(@Body() body: { appId: string, officerId: string }) {
    return {
      success: true,
      data: this.supervisorService.assignApplication(body.appId, body.officerId),
      message: 'OK'
    };
  }

  @Patch('review/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPERVISOR)
  @ApiOperation({ summary: 'Review an escalated application' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ schema: { type: 'object', properties: { action: { type: 'string', enum: ['approve', 'reject'] }, remarks: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Escalated application reviewed' })
  reviewEscalated(@Param('id') id: string, @Body() body: { action: 'approve' | 'reject', remarks: string }) {
    return {
      success: true,
      data: this.supervisorService.reviewEscalated(id, body.action, body.remarks),
      message: 'OK'
    };
  }
}
