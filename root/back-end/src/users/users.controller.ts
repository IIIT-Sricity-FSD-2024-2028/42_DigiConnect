import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new citizen' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Citizen registered successfully' })
  register(@Body() createUserDto: CreateUserDto) {
    return {
      success: true,
      data: this.usersService.register(createUserDto),
      message: 'OK'
    };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'User logged in successfully' })
  login(@Body() body: any) {
    return {
      success: true,
      data: this.usersService.login(body),
      message: 'Login successful'
    };
  }

  @Post('request-otp')
  @ApiOperation({ summary: 'Request Aadhaar OTP (Simulator)' })
  @ApiBody({ schema: { type: 'object', properties: { phone: { type: 'string' }, aadhaar: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'OTP generated successfully' })
  requestOtp(@Body() body: { phone: string; aadhaar: string }) {
    const otp = this.usersService.requestOtp(body.phone, body.aadhaar);
    return {
      success: true,
      otp,
      message: `Simulation: OTP ${otp} sent to mobile ${body.phone}`
    };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Get all users' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findAll() {
    return {
      success: true,
      data: this.usersService.findAll(),
      message: 'OK'
    };
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'Return user matching ID' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  findById(@Param('id') id: string) {
    return {
      success: true,
      data: this.usersService.findById(id),
      message: 'OK'
    };
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(@Body() createUserDto: CreateUserDto) {
    return {
      success: true,
      data: this.usersService.create(createUserDto),
      message: 'OK'
    };
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Update a user' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return {
      success: true,
      data: this.usersService.update(id, updateUserDto),
      message: 'OK'
    };
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Change user password' })
  @ApiHeader({ name: 'x-user-id', description: 'ID of the caller', required: true })
  @ApiBody({ schema: { type: 'object', properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  changePassword(@Param('id') id: string, @Body() body: any) {
    // In a real app we'd verify x-user-id matches id, and verify currentPassword.
    // For this mock API, we just update it.
    return {
      success: true,
      data: this.usersService.update(id, { password: body.newPassword }),
      message: 'Password updated successfully'
    };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_USER)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiHeader({ name: 'x-role', description: 'Role of the caller', required: true })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string) {
    this.usersService.remove(id);
    return {
      success: true,
      message: 'User deleted successfully'
    };
  }
}
