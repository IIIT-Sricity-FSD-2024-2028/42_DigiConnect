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
  Headers,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader } from '@nestjs/swagger';
import { GeographyService } from './geography.service';
import { CreateNodeDto, UpdateNodeDto } from './dto/create-node.dto';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import { Role } from '../models/enums';

@ApiTags('geography')
@Controller('geography')
export class GeographyController {
  constructor(private readonly geographyService: GeographyService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated tier summary statistics for a state' })
  getStats(
    @Query('stateId') stateId?: string,
    @Headers('x-state-id') headerStateId?: string,
  ) {
    const targetState = stateId || headerStateId || 'state_ap';
    return {
      success: true,
      data: this.geographyService.getStateStats(targetState),
    };
  }

  @Get('audit')
  @ApiOperation({ summary: 'Get recent jurisdiction lifecycle audit activities' })
  getAuditLogs(
    @Query('stateId') stateId?: string,
    @Headers('x-state-id') headerStateId?: string,
  ) {
    const targetState = stateId || headerStateId || 'state_ap';
    return {
      success: true,
      data: this.geographyService.getAuditLogs(targetState),
    };
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get visual hierarchical jurisdiction tree' })
  getTree(
    @Query('stateId') stateId?: string,
    @Headers('x-state-id') headerStateId?: string,
  ) {
    const targetState = stateId || headerStateId || 'state_ap';
    return {
      success: true,
      data: this.geographyService.buildTree(targetState),
    };
  }

  @Get('nodes/:id/details')
  @ApiOperation({ summary: 'Get deep jurisdiction node details with dependencies and breadcrumbs' })
  getNodeDetails(@Param('id') id: string) {
    return {
      success: true,
      data: this.geographyService.getNodeDetails(id),
    };
  }

  @Get('nodes/:id')
  @ApiOperation({ summary: 'Get jurisdiction node details by ID' })
  getNode(@Param('id') id: string) {
    const node = this.geographyService.getNodeById(id);
    const ancestors = this.geographyService.getAncestors(id);
    return {
      success: true,
      data: {
        ...node,
        ancestors,
      },
    };
  }

  @Get('nodes/:id/children')
  @ApiOperation({ summary: 'Get direct child jurisdiction nodes' })
  getChildren(
    @Param('id') id: string,
    @Query('stateId') stateId?: string,
    @Headers('x-state-id') headerStateId?: string,
  ) {
    const parentId = id === 'root' || id === 'null' ? null : id;
    const targetState = stateId || headerStateId;
    return {
      success: true,
      data: this.geographyService.getChildren(parentId, targetState),
    };
  }

  @Get('nodes/:id/ancestors')
  @ApiOperation({ summary: 'Get ancestor path up to the State root' })
  getAncestors(@Param('id') id: string) {
    return {
      success: true,
      data: this.geographyService.getAncestors(id),
    };
  }

  @Get('scope-check')
  @ApiOperation({ summary: 'Check if a leaf node falls within an assigned officer node scope' })
  checkScope(
    @Query('leafNodeId') leafNodeId: string,
    @Query('assignedNodeId') assignedNodeId: string,
  ) {
    const inScope = this.geographyService.isNodeWithinScope(
      leafNodeId,
      assignedNodeId,
    );
    return {
      success: true,
      leafNodeId,
      assignedNodeId,
      inScope,
    };
  }

  @Post('nodes')
  @UseGuards(RolesGuard)
  @Roles(Role.STATE_ADMIN, Role.CENTRAL_ADMIN)
  @ApiHeader({ name: 'x-role', description: 'STATE_ADMIN or CENTRAL_ADMIN' })
  @ApiOperation({ summary: 'Create new dynamic jurisdiction node' })
  createNode(
    @Body() dto: CreateNodeDto,
    @Headers('x-role') role?: string,
    @Headers('x-state-id') headerStateId?: string,
  ) {
    // State Isolation enforcement: State Admin can only create nodes in their state
    if (role === Role.STATE_ADMIN && headerStateId && dto.stateId !== headerStateId) {
      throw new BadRequestException('State Admin can only create jurisdictions within their assigned state.');
    }
    const created = this.geographyService.createNode(dto);
    return {
      success: true,
      message: `Jurisdiction '${created.name}' created successfully.`,
      data: created,
    };
  }

  @Put('nodes/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STATE_ADMIN, Role.CENTRAL_ADMIN)
  @ApiHeader({ name: 'x-role', description: 'STATE_ADMIN or CENTRAL_ADMIN' })
  @ApiOperation({ summary: 'Update jurisdiction node properties (renaming keeps stable ID)' })
  updateNode(
    @Param('id') id: string,
    @Body() dto: UpdateNodeDto,
    @Headers('x-role') role?: string,
    @Headers('x-state-id') headerStateId?: string,
  ) {
    const node = this.geographyService.getNodeById(id);
    if (role === Role.STATE_ADMIN && headerStateId && node.stateId !== headerStateId) {
      throw new BadRequestException('State Admin can only update jurisdictions within their assigned state.');
    }
    const updated = this.geographyService.updateNode(id, dto);
    return {
      success: true,
      message: `Jurisdiction '${updated.name}' updated successfully.`,
      data: updated,
    };
  }

  @Patch('nodes/:id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.STATE_ADMIN, Role.CENTRAL_ADMIN)
  @ApiHeader({ name: 'x-role', description: 'STATE_ADMIN or CENTRAL_ADMIN' })
  @ApiOperation({ summary: 'Activate or deactivate a jurisdiction node' })
  toggleStatus(
    @Param('id') id: string,
    @Body('status') status: 'Active' | 'Inactive',
    @Headers('x-role') role?: string,
    @Headers('x-state-id') headerStateId?: string,
  ) {
    const node = this.geographyService.getNodeById(id);
    if (role === Role.STATE_ADMIN && headerStateId && node.stateId !== headerStateId) {
      throw new BadRequestException('State Admin can only modify jurisdictions within their assigned state.');
    }
    if (!status || (status !== 'Active' && status !== 'Inactive')) {
      throw new BadRequestException("Status must be either 'Active' or 'Inactive'.");
    }
    const updated = this.geographyService.toggleStatus(id, status);
    return {
      success: true,
      message: `Jurisdiction '${updated.name}' marked as ${status}.`,
      data: updated,
    };
  }

  @Delete('nodes/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.STATE_ADMIN, Role.CENTRAL_ADMIN)
  @ApiHeader({ name: 'x-role', description: 'STATE_ADMIN or CENTRAL_ADMIN' })
  @ApiOperation({ summary: 'Delete jurisdiction node (fails if dependencies exist; cascade=true deletes all descendants)' })
  deleteNode(
    @Param('id') id: string,
    @Query('cascade') cascade?: string,
    @Headers('x-role') role?: string,
    @Headers('x-state-id') headerStateId?: string,
  ) {
    const node = this.geographyService.getNodeById(id);
    if (role === Role.STATE_ADMIN && headerStateId && node.stateId !== headerStateId) {
      throw new BadRequestException('State Admin can only delete jurisdictions within their assigned state.');
    }
    return this.geographyService.deleteNode(id, cascade === 'true');
  }
}
