import { Injectable, NotFoundException } from '@nestjs/common';
import { db } from '../data/store';
import { Notification } from '../models/notification.model';

@Injectable()
export class NotificationsService {
  findByUser(userId: string) {
    return db.notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
      if (n.userId === userId) {
        n.read = true;
      }
    });
    return { success: true, message: 'All notifications marked as read' };
  }
}
