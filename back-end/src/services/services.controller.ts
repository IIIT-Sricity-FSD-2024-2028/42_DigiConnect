import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active services' })
  @ApiResponse({ status: 200, description: 'List of active services' })
  findActive() {
    return {
      success: true,
      data: this.servicesService.findActive(),
      message: 'OK'
    };
  }

  @Get('all')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Get all services (including inactive/draft)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'List of all services' })
  findAll() {
    return {
      success: true,
      data: this.servicesService.findAll(),
      message: 'OK'
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  @ApiResponse({ status: 200, description: 'Service details' })
  findById(@Param('id') id: string) {
    return {
      success: true,
      data: this.servicesService.findById(id),
      message: 'OK'
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Create a new service' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({ status: 201, description: 'Service created successfully' })
  create(@Body() createServiceDto: CreateServiceDto) {
    return {
      success: true,
      data: this.servicesService.create(createServiceDto),
      message: 'OK'
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Update an existing service' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({ status: 200, description: 'Service updated successfully' })
  update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
    return {
      success: true,
      data: this.servicesService.update(id, updateServiceDto),
      message: 'OK'
    };
  }

  @Patch(':id/toggle')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Toggle service status (Active/Inactive)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Service status toggled' })
  toggleStatus(@Param('id') id: string) {
    return {
      success: true,
      data: this.servicesService.toggleStatus(id),
      message: 'OK'
    };
  }
}
