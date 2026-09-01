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

  createNotification(data: Partial<Notification>) {
    const notification: Notification = {
      id: `NOT-${Math.floor(Math.random() * 90000 + 10000)}`,
      userId: data.userId || '',
      title: data.title || 'New Notification',
      message: data.message || '',
      type: data.type || 'info',
      read: false,
      date: new Date().toISOString(),
      link: data.link || '#'
    };
    db.notifications.unshift(notification);
    return notification;
  }

  /**
   * Auto-push a notification when an application status changes.
   * Called internally by ApplicationsService.
   */
  pushApplicationNotification(citizenId: string, appId: string, newStatus: string, officerRemark: string) {
    let config: { title: string; type: Notification['type'] } | undefined;
    switch (newStatus) {
      case 'approved':
        config = { title: '✅ Application Approved!', type: 'success' };
        break;
      case 'rejected':
        config = { title: '❌ Application Rejected', type: 'danger' };
        break;
      case 'query':
        config = { title: '❓ Query Raised on Application', type: 'warning' };
        break;
      case 'escalated':
        config = { title: '⚠️ Application Escalated', type: 'warning' };
        break;
      case 'completed':
        config = { title: '🎉 Service Completed', type: 'success' };
        break;
      case 'under-review':
        config = { title: 'ℹ️ Application Under Review', type: 'info' };
        break;
      default:
        return; // Don't push for unknown statuses
    }

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
    let config: { title: string; type: Notification['type'] } | undefined;
    switch (newStatus) {
      case 'resolved':
        config = { title: '✅ Grievance Resolved', type: 'success' };
        break;
      case 'rejected':
        config = { title: '❌ Grievance Rejected', type: 'danger' };
        break;
      case 'escalated':
        config = { title: '⚠️ Grievance Escalated to Supervisor', type: 'warning' };
        break;
      case 'escalated-resolved':
        config = { title: '✅ Grievance Closed by Supervisor', type: 'success' };
        break;
      case 'investigating':
        config = { title: 'ℹ️ Grievance Under Investigation', type: 'info' };
        break;
      default:
        return; // Don't push for unknown statuses
    }

    const notification: Notification = {
      id: `NOT-${Math.floor(Math.random() * 90000 + 10000)}`,
      userId: citizenId,
      title: config.title,
      message: `Your grievance (${grievanceId}) status is now "${newStatus}".`,
      type: config.type,
      read: false,
      date: new Date().toISOString(),
      link: `citizen/my-grievances.html?id=${grievanceId}`
    };

    db.notifications.unshift(notification);
  }
}
