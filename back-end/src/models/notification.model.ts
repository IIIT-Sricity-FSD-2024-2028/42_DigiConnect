export interface Notification {
  id: string; // 'NOT-XXX'
  userId: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'danger';
  read: boolean;
  date: string;
  link?: string;
}
