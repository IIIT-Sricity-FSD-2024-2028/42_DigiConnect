import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { Role } from '../models/enums';
import { generateId } from '../utils/helpers';

@Injectable()
export class SuperUserService {
  getDashboardStats() {
    return {
      totalUsers: db.users.length,
      activeServices: db.services.filter(s => s.status === 'Active').length,
      pendingOfficers: db.pendingOfficers.length,
      systemStatus: db.settings.maintenanceMode ? 'Maintenance' : 'Online',
    };
  }

  getSettings() {
    return db.settings;
  }

  updateSettings(settings: any) {
    db.settings = { ...db.settings, ...settings };
    return db.settings;
  }

  getPendingOfficers() {
    return db.pendingOfficers;
  }

  onboardOfficer(data: any) {
    const newOfficer = {
      id: generateId('EMP'),
      name: data.name,
      role: Role.OFFICER,
      title: data.title,
      email: data.email,
      phone: data.phone,
      aadhaar: 'XXXX XXXX XXXX', // Placeholder
      joinedDate: new Date().toLocaleDateString('en-GB'),
      status: 'Active',
      dept: data.dept,
      jurisdiction: data.jurisdiction,
      services: data.services || []
    };
    
    // @ts-ignore
    db.users.push(newOfficer);
    
    // Log the onboarding
    db.auditLogs.unshift({
      id: `LOG-${Math.floor(Math.random() * 10000)}`,
      action: 'Officer Onboarded',
      actor: 'Super User',
      role: 'SUPER_USER',
      date: new Date().toISOString(),
      details: `Onboarded new officer: ${newOfficer.name}`
    });

    return newOfficer;
  }

  approvePendingOfficer(id: string) {
    const index = db.pendingOfficers.findIndex(o => o.id === id);
    if (index === -1) throw new NotFoundException('Pending officer not found');

    const pending = db.pendingOfficers[index];
    const newOfficer = this.onboardOfficer(pending);
    
    // Remove from pending
    db.pendingOfficers.splice(index, 1);
    
    return newOfficer;
  }

  rejectPendingOfficer(id: string) {
    const index = db.pendingOfficers.findIndex(o => o.id === id);
    if (index === -1) throw new NotFoundException('Pending officer not found');

    db.pendingOfficers.splice(index, 1);
    return { success: true, message: 'Officer application rejected' };
  }
}
