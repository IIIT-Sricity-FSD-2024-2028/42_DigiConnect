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

    // Officer workload (derived from applications)
    const officerUsers = db.users.filter((u: any) => u.role === 'officer');
    const officerLoad = officerUsers.map((o: any) => {
      const active = db.applications.filter(a => a.officerId === o.id && !['approved', 'rejected'].includes(a.status)).length;
      return { name: o.name, role: o.title || o.role, load: active, max: 35 };
    });

    // Recent audit logs
    const recentAuditLogs = db.auditLogs.slice(0, 10);

    // Service category stats (for bar chart)
    const serviceStats = [
      { label: 'Income Certificate', val: db.applications.filter(a => a.serviceName === 'Income Certificate').length || 892, pct: 92, color: 'var(--navy-500)' },
      { label: 'Caste Certificate', val: db.applications.filter(a => a.serviceName === 'Caste Certificate').length || 674, pct: 70, color: 'var(--navy-400)' },
      { label: 'Welfare / Subsidy', val: db.applications.filter(a => a.serviceType === 'welfare').length || 521, pct: 54, color: 'var(--green-500)' },
      { label: 'Residence Certificate', val: db.applications.filter(a => a.serviceName === 'Residence Certificate').length || 408, pct: 42, color: 'var(--navy-300)' },
      { label: 'Permissions & Auth', val: db.applications.filter(a => a.serviceType === 'permission').length || 287, pct: 30, color: 'var(--amber-500)' },
      { label: 'Record Correction', val: db.applications.filter(a => a.serviceName === 'Record Correction').length || 186, pct: 19, color: 'var(--purple-500)' },
      { label: 'Grievances', val: db.grievances.length || 879, pct: 91, color: 'var(--orange-500)' },
    ];

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
      systemStatus: (db.settings as any).maintenanceMode ? 'Maintenance' : 'Online',
      // Dashboard panels
      slaBreaches: db.superSlaBreaches,
      recentAuditLogs,
      officerLoad,
      serviceStats,
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
    const formattedDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const newOfficer = {
      id: generateId('EMP'),
      name: data.name,
      role: Role.OFFICER,
      title: data.title,
      email: data.email,
      phone: data.phone,
      aadhaar: 'XXXX XXXX XXXX', // Placeholder
      joined: formattedDate,
      joinedDate: formattedDate,
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

  getAuditLogs() {
    return db.auditLogs;
  }

  createAuditLog(data: any, userId: string, role: string) {
    const newLog = {
      id: `LOG-${Math.floor(Math.random() * 90000 + 10000)}`,
      action: data.action || 'System Action',
      actor: userId || 'System',
      role: role || 'system',
      date: new Date().toISOString(),
      details: data.details || '',
      ip: '192.168.1.' + Math.floor(Math.random() * 255)
    };
    db.auditLogs.unshift(newLog);
    return newLog;
  }
}
