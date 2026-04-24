import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { Role } from '../models/enums';
import { generateId } from '../utils/helpers';

@Injectable()
export class SuperUserService {
  getDashboardStats() {
    const totalCitizens = db.users.filter(u => u.role === 'citizen').length;
    const totalOfficers = db.users.filter(u => u.role === 'officer' || u.role === 'grievance').length;
    const totalApplications = db.applications.length;
    const approvedApplications = db.applications.filter(a => a.status === 'approved').length;
    const pendingApplications = db.applications.filter(
      a => !['approved', 'rejected'].includes(a.status),
    ).length;
    const activeGrievances = db.grievances.filter(
      g => !['resolved', 'rejected', 'escalated-resolved'].includes(g.status),
    ).length;
    const activeServices = db.services.filter(s => s.status === 'Active').length;

    return {
      // Core system metrics
      totalUsers: db.users.length,
      totalCitizens,
      totalOfficers,
      // Application metrics
      totalApplications,
      approvedApplications,
      pendingApplications,
      // Grievance metrics
      activeGrievances,
      // Service metrics
      activeServices,
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
