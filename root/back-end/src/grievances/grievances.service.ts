import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { db } from '../data/store';
import { Grievance } from '../models/grievance.model';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { UpdateGrievanceDto } from './dto/update-grievance.dto';
import { generateId } from '../utils/helpers';
import { User } from '../models/user.model';
import { paginate } from '../utils/pagination.util';
import { GrievanceStatus } from '../models/enums';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GrievancesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  raise(createGrievanceDto: CreateGrievanceDto): Grievance {
    let citizen: User | null = null;
    try {
      citizen = this.usersService.findById(createGrievanceDto.citizenId);
    } catch(e) {}
    
    // Auto assign to a grievance officer
    const officer = this.usersService.findOfficerByRole('grievance');

    const newGrievance: Grievance = {
      id: generateId('GRV'),
      citizenId: createGrievanceDto.citizenId,
      citizenName: citizen ? citizen.name : 'Unknown Citizen',
      jurisdiction: citizen && citizen.jurisdiction ? citizen.jurisdiction : '-',
      officerId: officer ? officer.id : 'UNASSIGNED',
      officerName: officer ? officer.name : 'Unassigned',
      category: createGrievanceDto.category,
      subject: createGrievanceDto.subject,
      description: createGrievanceDto.description,
      relatedAppId: createGrievanceDto.relatedAppId,
      status: GrievanceStatus.OPEN,
      priority: 'medium', // Default priority, could be determined by category
      slaStatus: 'safe',
      filedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      history: [{ action: 'Grievance Filed', date: new Date().toISOString(), actor: citizen ? citizen.name : 'Citizen', note: 'Grievance submitted' }]
    };

    db.grievances.unshift(newGrievance);
    return newGrievance;
  }

  findAll(page: number, limit: number, userId?: string) {
    let filteredGrievances = db.grievances;

    if (userId) {
      let officer: User | null = null;
      try {
        officer = this.usersService.findById(userId);
      } catch(e) {}
      if (officer && officer.role === 'grievance' && officer.jurisdiction && officer.jurisdiction !== 'All') {
        const jurisdiction = officer.jurisdiction;
        filteredGrievances = db.grievances.filter(g => g.jurisdiction === jurisdiction);
      }
    }

    return paginate(filteredGrievances, page, limit);
  }

  findById(id: string): Grievance {
    const grievance = db.grievances.find(g => g.id === id);
    if (!grievance) throw new NotFoundException('Grievance not found');
    return grievance;
  }

  findByCitizen(citizenId: string, page: number, limit: number) {
    const grievances = db.grievances.filter(g => g.citizenId === citizenId);
    return paginate(grievances, page, limit);
  }

  updateStatus(id: string, updateGrievanceDto: UpdateGrievanceDto, actorName: string): Grievance {
    const grievanceIndex = db.grievances.findIndex(g => g.id === id);
    if (grievanceIndex === -1) throw new NotFoundException('Grievance not found');

    const grievance = db.grievances[grievanceIndex];
    grievance.status = updateGrievanceDto.status;
    grievance.lastUpdated = new Date().toISOString();
    
    grievance.history.push({
      action: `Status updated to ${updateGrievanceDto.status}`,
      date: new Date().toISOString(),
      actor: actorName,
      note: updateGrievanceDto.resolutionNote || ''
    });

    db.grievances[grievanceIndex] = grievance;

    // Auto-push notification to citizen
    this.notificationsService.pushGrievanceNotification(
      grievance.citizenId,
      grievance.id,
      updateGrievanceDto.status
    );

    return grievance;
  }

  addReply(id: string, reply: string, userId: string): Grievance {
    const grievanceIndex = db.grievances.findIndex(g => g.id === id);
    if (grievanceIndex === -1) throw new NotFoundException('Grievance not found');

    const grievance = db.grievances[grievanceIndex];
    if (grievance.citizenId !== userId) {
      throw new BadRequestException('Not authorized to reply to this grievance');
    }

    grievance.lastUpdated = new Date().toISOString();
    grievance.history.push({
      action: 'Citizen Update',
      date: new Date().toISOString(),
      actor: 'Citizen',
      note: reply
    });

    db.grievances[grievanceIndex] = grievance;
    return grievance;
  }
}
