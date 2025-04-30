import { NotFoundError } from '../errors/http.error.js';
import NotificationRepository from '../repositories/notification.repository.js';

class NotificationService {
  notificationRepository = new NotificationRepository();

  // 알림 전체 내역 조회
  getAllNotification = async (userId) => {
    const notification =
      await this.notificationRepository.getAllNotification(userId);
    return notification;
  };

  // 알림 상세 내역 조회
  getOneNotification = async (notificationId, userId) => {
    const notification = await this.notificationRepository.getOneNotification(
      notificationId,
      userId,
    );
    if (!notification) throw new NotFoundError('알림 내역이 없습니다.');
    return notification;
  };
}

export default NotificationService;
