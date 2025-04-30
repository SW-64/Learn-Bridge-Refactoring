import { prisma } from '../utils/prisma.utils.js';

class NotifcationRepository{
    // 알림 전체 내역 조회
    getAllNotification = async()=>{
        const notification = await prisma.notification.findMany({
            where:{
                isRead:false
            },
            orderBy:{
                createdAt:'desc'
            }
        })
        return notification
    }

    // 알림 상세 내역 조회
    getOneNotification = async(notificationId)=>{
        const notification = await prisma.notification.findUnique({
            where:{
                id:notificationId
            }
        })
        const changeIsRead = await prisma.notification.update({
            where:{
                id:notificationId
            },
            data:{
                isRead:true
            }
        })
        return notification
    }

}

export default NotifcationRepository