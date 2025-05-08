import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<Notification>,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async createNotification(
    userIds: string[],
    title: string,
    message: string,
    link: string,
  ) {
    try {
      // สร้างการแจ้งเตือนใหม่
      const newNotification = new this.notificationModel({
        title,
        message,
        link,
        users: userIds.map((userId) => ({ userId, isRead: false })),
      });

      // บันทึกการแจ้งเตือนในฐานข้อมูล
      await newNotification.save();

      // ส่งการแจ้งเตือนผ่าน WebSocket หรือระบบเรียลไทม์
      this.notificationGateway.sendToUsers(userIds, { title, message, link });
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new InternalServerErrorException('Failed to create notification');
    }
  }
  async fetchNotifications(userId: string) {
    return await this.notificationModel.aggregate([
      { $unwind: '$users' },
      { $match: { 'users.userId': new mongoose.Types.ObjectId(userId) } },
      {
        $project: {
          title: 1,
          message: 1,
          link: 1,
          createdAt: 1,
          isRead: '$users.isRead',
        },
      },
      { $sort: { createdAt: -1 } },
    ]);
  }
  async getUnreadCountForUser(userId: string): Promise<number> {
    const unreadNotifications = await this.notificationModel.aggregate([
      { $unwind: '$users' }, // แยก users ออกเป็น document ต่างๆ
      {
        $match: {
          'users.userId': new mongoose.Types.ObjectId(userId),
          'users.isRead': false,
        },
      }, // กรองที่ userId ตรงกับที่ต้องการ และ isRead เป็น false
      { $count: 'unreadCount' }, // นับจำนวนที่ไม่อ่าน
    ]);

    // คืนค่าจำนวน unread notifications
    return unreadNotifications.length > 0
      ? unreadNotifications[0].unreadCount
      : 0;
  }

  // Method สำหรับ mark notification as read
  async markNotificationAsRead(userId: string) {
    return await this.notificationModel.updateMany(
      { 'users.userId': userId }, // ค้นหาด้วย userId ใน users อาร์เรย์
      { $set: { 'users.$.isRead': true } }, // อัปเดต isRead เป็น true
    );
  }

  // create(createNotificationDto: CreateNotificationDto) {
  //   return 'This action adds a new notification';
  // }

  findAll() {
    return `This action returns all notification`;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} notification`;
  // }

  // update(id: number, updateNotificationDto: UpdateNotificationDto) {
  //   return `This action updates a #${id} notification`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} notification`;
  // }
}
