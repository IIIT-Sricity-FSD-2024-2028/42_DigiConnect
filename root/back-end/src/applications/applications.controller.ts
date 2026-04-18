import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Submit a new application' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  submit(@Body() createApplicationDto: CreateApplicationDto) {
    return {
      success: true,
      data: this.applicationsService.submit(createApplicationDto),
      message: 'OK'
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.SUPERVISOR, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get all applications (paginated)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'List of all applications' })
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return {
      success: true,
      ...this.applicationsService.findAll(+page, +limit),
      message: 'OK'
    };
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Get my applications (paginated)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiResponse({ status: 200, description: 'List of citizen applications' })
  findMy(@Headers('x-user-id') userId: string, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return {
      success: true,
      ...this.applicationsService.findByCitizen(userId, +page, +limit),
      message: 'OK'
    };
  }

  @Get('track/:ref')
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Track application by reference' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Application found' })
  track(@Param('ref') ref: string) {
    return {
      success: true,
      data: this.applicationsService.findByRef(ref),
      message: 'OK'
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Application found' })
  findById(@Param('id') id: string) {
    return {
      success: true,
      data: this.applicationsService.findById(id),
      message: 'OK'
    };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Update application status' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiBody({ type: UpdateStatusDto })
  @ApiResponse({ status: 200, description: 'Application status updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Headers('x-user-id') userId: string
  ) {
    // In a real app, you'd fetch the user's name from DB based on userId. using a placeholder here for simplicity if user not found.
    return {
      success: true,
      data: this.applicationsService.updateStatus(id, updateStatusDto, userId || 'Officer'),
      message: 'OK'
    };
  }
}
