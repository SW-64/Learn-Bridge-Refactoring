import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationService from '../../src/services/notification.service.js';
import { NotFoundError } from '../../src/errors/http.error.js';

describe('NotificationService', () => {
  let service;

  beforeEach(() => {
    service = new NotificationService();
    service.notificationRepository = {
      getAllNotification: vi.fn(),
      getOneNotification: vi.fn(),
    };
    vi.clearAllMocks();
  });

  describe('getAllNotification', () => {
    it('should return all notifications for a user', async () => {
      const dummyNotifications = [{ id: 1, content: '알림1' }];
      service.notificationRepository.getAllNotification.mockResolvedValue(
        dummyNotifications,
      );

      const result = await service.getAllNotification(1);
      expect(result).toEqual(dummyNotifications);
      expect(
        service.notificationRepository.getAllNotification,
      ).toHaveBeenCalledWith(1);
    });
  });

  describe('getOneNotification', () => {
    it('should return a specific notification if it exists', async () => {
      const dummyNotification = { id: 1, content: '알림1' };
      service.notificationRepository.getOneNotification.mockResolvedValue(
        dummyNotification,
      );

      const result = await service.getOneNotification(1, 1);
      expect(result).toEqual(dummyNotification);
      expect(
        service.notificationRepository.getOneNotification,
      ).toHaveBeenCalledWith(1, 1);
    });

    it('should throw NotFoundError if notification does not exist', async () => {
      service.notificationRepository.getOneNotification.mockResolvedValue(null);

      await expect(service.getOneNotification(1, 1)).rejects.toThrow(
        new NotFoundError('알림 내역이 없습니다.'),
      );
    });
  });
});
