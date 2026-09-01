import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Headers, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import 'multer';
import { Throttle } from '@nestjs/throttler';
import { documentUploadConfig } from '../middlewares/file-upload.config';
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
  @UseInterceptors(FilesInterceptor('documents', 10, documentUploadConfig))
  @ApiOperation({ summary: 'Submit a new application' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  submit(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      const uploadedDocs = files.map(f => ({
        name: f.originalname,
        type: f.mimetype,
        date: new Date().toISOString(),
        status: 'Uploaded',
        size: `${(f.size / 1024).toFixed(1)} KB`,
        path: f.path,
      }));
      if (createApplicationDto.documents && Array.isArray(createApplicationDto.documents)) {
        createApplicationDto.documents.push(...uploadedDocs);
      } else {
        createApplicationDto.documents = uploadedDocs;
      }
    }
    if (typeof createApplicationDto.formData === 'string') {
      try {
        createApplicationDto.formData = JSON.parse(createApplicationDto.formData);
      } catch (e) {}
    }
    return {
      success: true,
      data: this.applicationsService.submit(createApplicationDto),
      message: 'Application submitted successfully'
    };
  }

  @Throttle({ default: { limit: 10, ttl: 60000 } })
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

  @Get('officer-queue')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Get officer application queue' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiHeader({ name: 'x-user-id', description: 'Officer ID', required: false })
  @ApiResponse({ status: 200, description: 'Officer queue retrieved' })
  getOfficerQueue(@Headers('x-user-id') userId?: string) {
    return { success: true, data: this.applicationsService.getOfficerQueue(userId), message: 'OK' };
  }

  @Get('officer-queries')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Get officer pending queries' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Officer queries retrieved' })
  getOfficerQueries(@Headers('x-user-id') userId?: string) {
    return { success: true, data: this.applicationsService.getOfficerQueries(userId), message: 'OK' };
  }

  @Get('officer-activity')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Get officer recent activity' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Officer activity retrieved' })
  getOfficerActivity(@Headers('x-user-id') userId?: string) {
    return { success: true, data: this.applicationsService.getOfficerActivity(userId), message: 'OK' };
  }

  @Get('officer-sla-risks')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Get SLA at-risk items for officer' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'SLA risks retrieved' })
  getOfficerSlaRisks(@Headers('x-user-id') userId?: string) {
    return { success: true, data: this.applicationsService.getOfficerSlaRisks(userId), message: 'OK' };
  }

  @Get('officer-week-chart')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER)
  @ApiOperation({ summary: 'Get officer weekly performance chart data' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Week chart data retrieved' })
  getOfficerWeekChart(@Headers('x-user-id') userId?: string) {
    return { success: true, data: this.applicationsService.getOfficerWeekChart(userId), message: 'OK' };
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

  // ─── THE 3 PRIMARY OFFICER ACTIONS (Sections 18-22) ───

  @Post(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.SUPERVISOR, Role.DEPARTMENT_HEAD)
  @ApiOperation({ summary: 'Officer Action 1: APPROVE application stage' })
  @ApiHeader({ name: 'x-role', description: 'OFFICER' })
  @ApiHeader({ name: 'x-user-id', description: 'Officer ID' })
  approve(
    @Param('id') id: string,
    @Body('remarks') remarks: string,
    @Headers('x-user-id') userId: string,
  ) {
    const result = this.applicationsService.approve(id, userId || 'Officer', remarks);
    return {
      success: true,
      message: result.certificate ? 'Application fully approved & certificate generated!' : 'Application stage approved.',
      data: result,
    };
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.SUPERVISOR, Role.DEPARTMENT_HEAD)
  @ApiOperation({ summary: 'Officer Action 2: REJECT application' })
  @ApiHeader({ name: 'x-role', description: 'OFFICER' })
  @ApiHeader({ name: 'x-user-id', description: 'Officer ID' })
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Headers('x-user-id') userId: string,
  ) {
    const app = this.applicationsService.reject(id, userId || 'Officer', reason || 'Rejection during verification.');
    return {
      success: true,
      message: 'Application rejected.',
      data: app,
    };
  }

  @Post(':id/raise-query')
  @UseGuards(RolesGuard)
  @Roles(Role.OFFICER, Role.SUPERVISOR, Role.DEPARTMENT_HEAD)
  @ApiOperation({ summary: 'Officer Action 3: RAISE QUERY (workflow paused)' })
  @ApiHeader({ name: 'x-role', description: 'OFFICER' })
  @ApiHeader({ name: 'x-user-id', description: 'Officer ID' })
  raiseQuery(
    @Param('id') id: string,
    @Body('queryText') queryText: string,
    @Headers('x-user-id') userId: string,
  ) {
    const app = this.applicationsService.raiseQuery(id, userId || 'Officer', queryText || 'Clarification required.');
    return {
      success: true,
      message: 'Query raised and workflow paused.',
      data: app,
    };
  }

  @Get(':id/certificate')
  @ApiOperation({ summary: 'Get digital certificate metadata and download link' })
  getCertificate(@Param('id') id: string) {
    const app = this.applicationsService.findById(id);
    const certId = (app as any).certificateId;
    return {
      success: true,
      data: {
        applicationId: app.id,
        certificateId: certId || null,
        isIssued: !!certId,
        downloadUrl: certId ? `/uploads/certificates/${certId}.html` : null,
        viewUrl: certId ? `/api/v1/certificates/${certId}` : null,
      },
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
  @UseInterceptors(FilesInterceptor('documents', 10, documentUploadConfig))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({ summary: 'Respond to officer query with optional files' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ schema: { type: 'object', properties: { response: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Query response submitted' })
  respondToQuery(
    @Param('id') id: string,
    @Body('response') response: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const uploadedDocs = (files && files.length > 0)
      ? files.map(f => ({
          name: f.originalname,
          type: f.mimetype,
          date: new Date().toISOString(),
          status: 'Uploaded',
          size: `${(f.size / 1024).toFixed(1)} KB`,
          path: f.path,
        }))
      : [];
    return {
      success: true,
      data: this.applicationsService.respondToQuery(id, response || '', uploadedDocs),
      message: 'OK'
    };
  }
}
