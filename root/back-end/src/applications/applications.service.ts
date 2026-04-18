import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { Application } from '../models/application.model';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { generateId } from '../utils/helpers';
import { paginate } from '../utils/pagination.util';
import { AppStatus } from '../models/enums';

@Injectable()
export class ApplicationsService {
  submit(createApplicationDto: CreateApplicationDto): Application {
    const service = db.services.find(s => s.id === createApplicationDto.serviceId);
    const citizen = db.users.find(u => u.id === createApplicationDto.citizenId);
    
    // Auto-assign logic (find an officer in the target department)
    const officer = db.users.find(u => u.role === 'officer' && u.dept === createApplicationDto.dept) || db.users.find(u => u.role === 'officer');

    const newApp: Application = {
      id: generateId('APP'),
      serviceId: createApplicationDto.serviceId,
      serviceName: service ? service.name : 'Unknown Service',
      serviceType: service ? service.cat.toLowerCase() : 'unknown',
      citizenId: createApplicationDto.citizenId,
      citizenName: citizen ? citizen.name : 'Unknown Citizen',
      officerId: officer ? officer.id : 'UNASSIGNED',
      officerName: officer ? officer.name : 'Unassigned',
      dept: createApplicationDto.dept,
      status: AppStatus.PENDING,
      remarks: createApplicationDto.remarks || '',
      fee: createApplicationDto.fee || 0,
      paymentStatus: 'pending',
      submittedDate: new Date().toISOString(),
      slaDate: new Date(Date.now() + (service ? service.sla : 7) * 24 * 60 * 60 * 1000).toISOString(),
      timeline: [{ action: 'Application Submitted', date: new Date().toISOString(), actor: citizen ? citizen.name : 'Citizen', note: 'Application received' }],
      documents: createApplicationDto.documents || []
    };

    db.applications.unshift(newApp); // Add to beginning
    return newApp;
  }

  findAll(page: number, limit: number) {
    return paginate(db.applications, page, limit);
  }

  findById(id: string): Application {
    const app = db.applications.find(a => a.id === id);
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  findByRef(ref: string): Application {
    const app = db.applications.find(a => a.id === ref);
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  findByCitizen(citizenId: string, page: number, limit: number) {
    const apps = db.applications.filter(a => a.citizenId === citizenId);
    return paginate(apps, page, limit);
  }

  updateStatus(id: string, updateStatusDto: UpdateStatusDto, actorName: string): Application {
    const appIndex = db.applications.findIndex(a => a.id === id);
    if (appIndex === -1) throw new NotFoundException('Application not found');

    const app = db.applications[appIndex];
    app.status = updateStatusDto.status;
    if (updateStatusDto.remarks) app.remarks = updateStatusDto.remarks;
    
    app.timeline.push({
      action: `Status updated to ${updateStatusDto.status}`,
      date: new Date().toISOString(),
      actor: actorName,
      note: updateStatusDto.remarks || ''
    });

    db.applications[appIndex] = app;
    return app;
  }
}
