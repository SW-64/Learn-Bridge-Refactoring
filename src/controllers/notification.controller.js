import { HTTP_STATUS } from "../constants/http-status.constant.js";
import NotificationService from "../services/notification.service.js"

class NotificationController{
    notificationService = new NotificationService()

    // 알림 내역 전체 조회
    getAllNotification = async(req,res,next)=>{
        try{
            const notification = await this.notificationService.getAllNotification();
      return res.status(HTTP_STATUS.OK).json({
        status: HTTP_STATUS.OK,
        message: '알림 내역 전체 조회 ',
        notification,
      });
        }catch(err){
            next(err)
        }
    }
    // 알림 내역 상세 조회
    getOneNotification = async(req,res,next)=>{
        try{
            const { notificationId } = req.params;
            const notification = await this.notificationService.getOneNotification(+notificationId);
            return res.status(HTTP_STATUS.OK).json({
                status: HTTP_STATUS.OK,
                message: '알림 내역 상세 조회 ',
                notification,
              });
        }catch(err){
            next(err)
        }
    }
}

export default NotificationController