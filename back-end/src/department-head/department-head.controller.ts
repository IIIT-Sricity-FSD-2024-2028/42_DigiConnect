import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { DepartmentHeadService } from './department-head.service';
import {
  CreateDesignationDto,
  OnboardOfficerDto,
  UpdateOfficerStatusDto,
} from './dto/create-designation.dto';
import { CreateDynamicServiceDto } from './dto/create-service.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('department-head')
@Controller('department-head')
export class DepartmentHeadController {
  constructor(private readonly deptHeadService: DepartmentHeadService) {}

  // ─── DESIGNATIONS ────────────────────────────────────────────────────────
  @Get('designations')
  @ApiOperation({ summary: 'List designations for a department' })
  listDesignations(
    @Query('departmentId') departmentId?: string,
    @Headers('x-department-id') headerDeptId?: string,
  ) {
    const dept = departmentId || headerDeptId || 'dept_rev_ap';
    return {
      success: true,
      data: this.deptHeadService.listDesignations(dept),
    };
  }

  @Post('designations')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiHeader({ name: 'x-role', description: 'DEPARTMENT_HEAD or STATE_ADMIN' })
  @ApiOperation({ summary: 'Create department designation (roles, no levels)' })
  createDesignation(@Body() dto: CreateDesignationDto) {
    const created = this.deptHeadService.createDesignation(dto);
    return {
      success: true,
      message: `Designation '${created.title}' created successfully.`,
      data: created,
    };
  }

  @Delete('designations/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiOperation({ summary: 'Delete designation' })
  deleteDesignation(@Param('id') id: string) {
    return this.deptHeadService.deleteDesignation(id);
  }

  // ─── OFFICERS ────────────────────────────────────────────────────────────
  @Get('officers')
  @ApiOperation({ summary: 'List officers mapped to department' })
  listOfficers(
    @Query('departmentId') departmentId?: string,
    @Headers('x-department-id') headerDeptId?: string,
  ) {
    return {
      success: true,
      data: this.deptHeadService.listOfficers(departmentId || headerDeptId),
    };
  }

  @Post('officers')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiHeader({ name: 'x-role', description: 'DEPARTMENT_HEAD or STATE_ADMIN' })
  @ApiOperation({ summary: 'Onboard officer mapped to exact jurisdiction node' })
  onboardOfficer(@Body() dto: OnboardOfficerDto) {
    const officer = this.deptHeadService.onboardOfficer(dto);
    return {
      success: true,
      message: `Officer '${officer.name}' onboarded as '${officer.designationTitle}' successfully.`,
      data: officer,
    };
  }

  @Patch('officers/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiOperation({ summary: 'Suspend / Unsuspend / Modify officer status' })
  updateOfficerStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOfficerStatusDto,
  ) {
    const updated = this.deptHeadService.updateOfficerStatus(id, dto.status);
    return {
      success: true,
      message: `Officer '${updated.name}' status updated to '${dto.status}'.`,
      data: updated,
    };
  }

  // ─── DYNAMIC SERVICES ────────────────────────────────────────────────────
  @Get('services')
  @ApiOperation({ summary: 'Browse department services' })
  listServices(
    @Query('departmentId') departmentId?: string,
    @Query('stateId') stateId?: string,
  ) {
    return {
      success: true,
      data: this.deptHeadService.listServices(departmentId, stateId),
    };
  }

  @Get('services/:id')
  @ApiOperation({ summary: 'Get complete service specification & form configuration' })
  getService(@Param('id') id: string) {
    return {
      success: true,
      data: this.deptHeadService.getServiceById(id),
    };
  }

  @Post('services')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiHeader({ name: 'x-role', description: 'DEPARTMENT_HEAD' })
  @ApiOperation({ summary: 'Create service with dynamic fields & workflow steps' })
  createService(@Body() dto: CreateDynamicServiceDto) {
    const service = this.deptHeadService.createService(dto);
    return {
      success: true,
      message: `Service '${service.name}' created with ${service.fields.length} dynamic fields and ${service.workflowSteps.length} workflow steps.`,
      data: service,
    };
  }

  @Patch('services/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiOperation({ summary: 'Enable / Disable / Suspend service' })
  updateServiceStatus(
    @Param('id') id: string,
    @Body('status') status: 'ACTIVE' | 'DISABLED' | 'SUSPENDED',
  ) {
    const updated = this.deptHeadService.updateServiceStatus(id, status);
    return {
      success: true,
      message: `Service '${updated.name}' status updated to '${status}'.`,
      data: updated,
    };
  }

  @Put('services/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiOperation({ summary: 'Update existing dynamic service & workflow schema' })
  updateService(
    @Param('id') id: string,
    @Body() dto: CreateDynamicServiceDto,
  ) {
    const service = this.deptHeadService.updateService(id, dto);
    return {
      success: true,
      message: `Service '${service.name}' updated successfully.`,
      data: service,
    };
  }

  @Delete('services/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiOperation({ summary: 'Delete dynamic service from department catalog' })
  deleteService(@Param('id') id: string) {
    return this.deptHeadService.deleteService(id);
  }

  @Get('analytics')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiOperation({ summary: 'Department operational analytics' })
  getDepartmentAnalytics(
    @Query('departmentId') departmentId?: string,
    @Headers('x-department-id') headerDeptId?: string,
  ) {
    const dept = departmentId || headerDeptId || 'dept_rev_ap';
    return {
      success: true,
      data: this.deptHeadService.getDepartmentAnalytics(dept),
    };
  }

  @Get('revenue')
  @UseGuards(RolesGuard)
  @Roles(Role.DEPARTMENT_HEAD, Role.STATE_ADMIN)
  @ApiOperation({ summary: 'Department financial revenue analytics & transaction ledger' })
  getDepartmentRevenue(
    @Query('departmentId') departmentId?: string,
    @Headers('x-department-id') headerDeptId?: string,
  ) {
    const dept = departmentId || headerDeptId || 'dept_rev_ap';
    return {
      success: true,
      data: this.deptHeadService.getDepartmentRevenue(dept),
    };
  }
}
