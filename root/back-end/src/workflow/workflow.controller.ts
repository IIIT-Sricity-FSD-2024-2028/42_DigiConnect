import { Controller, Get, Post, Body, Param, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { TransitionDto } from './dto/transition.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('workflow')
@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get('config')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Get workflow transition configuration' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Workflow config map' })
  getConfig() {
    return {
      success: true,
      data: this.workflowService.getConfig(),
      message: 'OK'
    };
  }

  @Post('transition')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Transition application status' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ type: TransitionDto })
  @ApiResponse({ status: 200, description: 'Transition successful' })
  transition(@Body() transitionDto: TransitionDto, @Headers('x-user-id') userId: string) {
    // Basic actor tracking
    if (!transitionDto.actorName) {
      transitionDto.actorName = userId || 'Officer';
    }
    
    try {
      return {
        success: true,
        data: this.workflowService.transition(transitionDto),
        message: 'Status transition successful'
      };
    } catch (e) {
      return {
        success: false,
        message: e.message
      };
    }
  }

  @Get('history/:appId')
  @ApiOperation({ summary: 'Get application transition history' })
  @ApiResponse({ status: 200, description: 'History retrieved' })
  getHistory(@Param('appId') appId: string) {
    return {
      success: true,
      data: this.workflowService.getHistory(appId),
      message: 'OK'
    };
  }

  @Get('audit-logs')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Get system audit logs' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved' })
  getAuditLogs() {
    return {
      success: true,
      data: this.workflowService.getAuditLogs(),
      message: 'OK'
    };
  }
}
