import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from 'src/schema/notification.schema';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
    ]),
  ],
  controllers: [NotificationController],
  providers: [NotificationGateway, NotificationService], // NotificationService ต้องอยู่ใน providers
  exports: [NotificationService], // Export NotificationService เพื่อให้ใช้ในที่อื่นได้
})
export class NotificationModule {}
