import { Controller, Get, Param, Patch } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @Get(':userId')
  async fetchNotifications(@Param('userId') userId: string) {
    return await this.notificationService.fetchNotifications(userId);
  }
  @Get()
  async findAll() {
    return this.notificationService.findAll();
  }
  @Patch('/read/:userId')
  async markNotificationAsRead(@Param('userId') userId: string) {
    return await this.notificationService.markNotificationAsRead(userId);
  }
}
