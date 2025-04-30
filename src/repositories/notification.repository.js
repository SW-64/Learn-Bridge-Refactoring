import { prisma } from '../utils/prisma.utils.js';

class NotificationRepository {
  // 알림 전체 내역 조회
  getAllNotification = async (userId) => {
    const notification = await prisma.notification.findMany({
      where: {
        isRead: false,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return notification;
  };

  // 알림 상세 내역 조회
  getOneNotification = async (notificationId, userId) => {
    const notification = await prisma.notification.findUnique({
      where: {
        notificationId,
        userId,
      },
    });
    const changeIsRead = await prisma.notification.update({
      where: {
        notificationId,
      },
      data: {
        isRead: true,
      },
    });
    return notification;
  };
}

export default NotificationRepository;
