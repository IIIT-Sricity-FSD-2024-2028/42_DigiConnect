import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Headers, Delete } from '@nestjs/common';
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

  @Post('simulate-payment')
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Simulate Bank Payment Handshake' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ schema: { type: 'object', properties: { serviceId: { type: 'string' }, citizenId: { type: 'string' }, amount: { type: 'number' } } } })
  @ApiResponse({ status: 200, description: 'Payment successful' })
  async simulatePayment(@Body() body: { serviceId: string; citizenId: string; amount: number }) {
    // Simulate an async 2-second delay to mimic bank gateway handshake
    await new Promise(resolve => setTimeout(resolve, 2000));
    const transactionId = `TXN-${Math.floor(1000000 + Math.random() * 9000000)}A`;
    return {
      success: true,
      transactionId,
      status: 'paid',
      message: `Simulation: Payment of ₹${body.amount} successful. Transaction ID: ${transactionId}`
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.SUPERVISOR, Role.SUPER_USER)
  @ApiOperation({ summary: 'Get all applications (paginated, filterable)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: false })
  @ApiResponse({ status: 200, description: 'List of applications' })
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('officerId') officerId?: string,
    @Query('status') status?: string,
    @Headers('x-user-id') userId?: string
  ) {
    return {
      success: true,
      ...this.applicationsService.findAll(+page, +limit, officerId, status),
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
    return {
      success: true,
      data: this.applicationsService.updateStatus(id, updateStatusDto, userId || 'Officer'),
      message: 'OK'
    };
  }

  @Post(':id/request-verification')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Request cross-department verification (spawns sub-task)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Verification requested' })
  requestVerification(
    @Param('id') id: string,
    @Body() body: { targetDept: string, reason: string },
    @Headers('x-user-id') userId: string
  ) {
    return {
      success: true,
      data: this.applicationsService.requestVerification(id, body.targetDept, body.reason, userId || 'Officer'),
      message: 'OK'
    };
  }

  @Post(':id/resolve-verification')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Resolve cross-department verification (unlocks main task)' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Verification resolved' })
  resolveVerification(
    @Param('id') id: string,
    @Body() body: { remarks: string },
    @Headers('x-user-id') userId: string
  ) {
    return {
      success: true,
      data: this.applicationsService.resolveVerification(id, body.remarks, userId || 'Officer'),
      message: 'OK'
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Withdraw an application' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Application withdrawn successfully' })
  remove(@Param('id') id: string) {
    this.applicationsService.remove(id);
    return {
      success: true,
      message: 'Application withdrawn successfully'
    };
  }

  @Patch(':id/query-response')
  @UseGuards(RolesGuard)
  @Roles(Role.CITIZEN)
  @ApiOperation({ summary: 'Respond to officer query' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ schema: { type: 'object', properties: { response: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Query response submitted' })
  respondToQuery(@Param('id') id: string, @Body('response') response: string) {
    return {
      success: true,
      data: this.applicationsService.respondToQuery(id, response),
      message: 'OK'
    };
  }
}
