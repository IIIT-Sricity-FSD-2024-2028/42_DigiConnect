import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody } from '@nestjs/swagger';
import { GrievancesService } from './grievances.service';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { UpdateGrievanceDto } from './dto/update-grievance.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('grievances')
@Controller('grievances')
export class GrievancesController {
  constructor(private readonly grievancesService: GrievancesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Raise a new grievance' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ type: CreateGrievanceDto })
  @ApiResponse({ status: 201, description: 'Grievance raised successfully' })
  raise(@Body() createGrievanceDto: CreateGrievanceDto) {
    return {
      success: true,
      data: this.grievancesService.raise(createGrievanceDto),
      message: 'OK'
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.SUPERVISOR, Role.SUPER_USER, Role.GRIEVANCE)
  @ApiOperation({ summary: 'Get all grievances (paginated)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: false })
  @ApiResponse({ status: 200, description: 'List of all grievances' })
  findAll(@Query('page') page: string = '1', @Query('limit') limit: string = '10', @Headers('x-user-id') userId: string) {
    return {
      success: true,
      ...this.grievancesService.findAll(+page, +limit, userId),
      message: 'OK'
    };
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Get my grievances (paginated)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiResponse({ status: 200, description: 'List of citizen grievances' })
  findMy(@Headers('x-user-id') userId: string, @Query('page') page: string = '1', @Query('limit') limit: string = '10') {
    return {
      success: true,
      ...this.grievancesService.findByCitizen(userId, +page, +limit),
      message: 'OK'
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grievance by ID' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Grievance found' })
  findById(@Param('id') id: string) {
    return {
      success: true,
      data: this.grievancesService.findById(id),
      message: 'OK'
    };
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.GRIEVANCE, Role.SUPERVISOR)
  @ApiOperation({ summary: 'Update grievance status' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiBody({ type: UpdateGrievanceDto })
  @ApiResponse({ status: 200, description: 'Grievance status updated' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateGrievanceDto: UpdateGrievanceDto,
    @Headers('x-user-id') userId: string
  ) {
    return {
      success: true,
      data: this.grievancesService.updateStatus(id, updateGrievanceDto, userId || 'Grievance Officer'),
      message: 'OK'
    };
  }

  @Patch(':id/reply')
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Reply to a grievance' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiBody({ schema: { type: 'object', properties: { reply: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Reply added successfully' })
  addReply(
    @Param('id') id: string,
    @Body('reply') reply: string,
    @Headers('x-user-id') userId: string
  ) {
    return {
      success: true,
      data: this.grievancesService.addReply(id, reply, userId),
      message: 'OK'
    };
  }
}
