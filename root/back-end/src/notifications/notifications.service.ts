import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationsService {
  findByUser(userId: string) {
    return db.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  getCount(userId: string) {
    return db.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  markAsRead(id: string) {
    const index = db.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new NotFoundException('Notification not found');
    db.notifications[index].read = true;
    return db.notifications[index];
  }

  markAllAsRead(userId: string) {
    db.notifications.forEach(n => {
      if (n.userId === userId) n.read = true;
    });
    return { success: true, message: 'All notifications marked as read' };
  }

  /**
   * Auto-push a notification when an application status changes.
   * Called internally by ApplicationsService.
   */
  pushApplicationNotification(citizenId: string, appId: string, newStatus: string, officerRemark: string) {
    const statusConfig: Record<string, { title: string; type: Notification['type'] }> = {
      'approved':   { title: '✅ Application Approved!',     type: 'success' },
      'rejected':   { title: '❌ Application Rejected',      type: 'danger'  },
      'query':      { title: '❓ Query Raised on Application', type: 'warning' },
      'escalated':  { title: '⚠️ Application Escalated',     type: 'warning' },
      'completed':  { title: '🎉 Service Completed',          type: 'success' },
      'under-review': { title: 'ℹ️ Application Under Review', type: 'info'   },
    };

    const config = statusConfig[newStatus];
    if (!config) return; // Don't push for unknown statuses

    const notification: Notification = {
      id: `NOT-${Math.floor(Math.random() * 90000 + 10000)}`,
      userId: citizenId,
      title: config.title,
      message: `Your application (${appId}) status changed to "${newStatus}". ${officerRemark ? 'Officer note: ' + officerRemark : ''}`,
      type: config.type,
      read: false,
      date: new Date().toISOString(),
      link: `citizen/track-application.html?id=${appId}`
    };

    db.notifications.unshift(notification);
  }

  /**
   * Auto-push a notification when a grievance status changes.
   */
  pushGrievanceNotification(citizenId: string, grievanceId: string, newStatus: string) {
    const statusConfig: Record<string, { title: string; type: Notification['type'] }> = {
      'resolved':          { title: '✅ Grievance Resolved',            type: 'success' },
      'rejected':          { title: '❌ Grievance Rejected',            type: 'danger'  },
      'escalated':         { title: '⚠️ Grievance Escalated to Supervisor', type: 'warning' },
      'escalated-resolved':{ title: '✅ Grievance Closed by Supervisor', type: 'success' },
      'investigating':     { title: 'ℹ️ Grievance Under Investigation', type: 'info'   },
    };

    const config = statusConfig[newStatus];
    if (!config) return;

    const notification: Notification = {
      id: `NOT-${Math.floor(Math.random() * 90000 + 10000)}`,
      userId: citizenId,
      title: config.title,
      message: `Your grievance (${grievanceId}) status is now "${newStatus}".`,
      type: config.type,
      read: false,
      date: new Date().toISOString(),
      link: `citizen/grievances.html?id=${grievanceId}`
    };

    db.notifications.unshift(notification);
  }
}
