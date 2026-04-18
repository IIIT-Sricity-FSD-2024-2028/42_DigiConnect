import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { Grievance } from '../models/grievance.model';
import { CreateGrievanceDto } from './dto/create-grievance.dto';
import { UpdateGrievanceDto } from './dto/update-grievance.dto';
import { generateId } from '../utils/helpers';
import { paginate } from '../utils/pagination.util';
import { GrievanceStatus } from '../models/enums';

@Injectable()
export class GrievancesService {
  raise(createGrievanceDto: CreateGrievanceDto): Grievance {
    const citizen = db.users.find(u => u.id === createGrievanceDto.citizenId);
    
    // Auto assign to a grievance officer
    const officer = db.users.find(u => u.role === 'grievance');

    const newGrievance: Grievance = {
      id: generateId('GRV'),
      citizenId: createGrievanceDto.citizenId,
      citizenName: citizen ? citizen.name : 'Unknown Citizen',
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

  findAll(page: number, limit: number) {
    return paginate(db.grievances, page, limit);
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
    return grievance;
  }
}
