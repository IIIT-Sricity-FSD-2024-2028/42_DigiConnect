import { Controller, Get, Post, Body, Patch, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';
import { serviceUploadConfig } from '../middlewares/file-upload.config';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { UploadTemplateDto } from './dto/upload-template.dto';
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

  @Post(':id/upload-template')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @UseInterceptors(FileInterceptor('file', serviceUploadConfig))
  @ApiOperation({ summary: 'Upload Scheme guideline or certificate template for a service' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller (must be super_user)', required: true })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UploadTemplateDto })
  @ApiResponse({ status: 201, description: 'Template uploaded successfully' })
  uploadTemplate(
    @Param('id') id: string,
    @Body() dto: UploadTemplateDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required for upload');
    }
    return {
      success: true,
      data: this.servicesService.uploadTemplate(id, file, dto.docType),
      message: `${dto.docType === 'guideline' ? 'Guideline' : 'Template'} uploaded successfully`
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
