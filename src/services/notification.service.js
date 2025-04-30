import { NotFoundError } from "../errors/http.error.js"
import NotifcationRepository from "../repositories/notification.repository.js"

class NotificationService{
    notificationRepository = new NotifcationRepository()

    // 알림 전체 내역 조회
    getAllNotification = async()=>{
        const notification = await this.notificationRepository.getAllNotification()
        return notification
    }

    // 알림 상세 내역 조회
    getOneNotification = async(notificationId)=>{
        const notification = await this.notificationRepository.getOneNotification(notificationId)
        if(!notification) throw new NotFoundError('알림 내역이 없습니다.')
        return notification
    }
}

export default NotificationService