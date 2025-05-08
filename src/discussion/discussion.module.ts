import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscussionController } from './discussion.controller';
import { DiscussionService } from './discussion.service';
import { DiscussionSchema } from '../schema/discussion.schema';
import UserSchema from '../schema/user.schema';
import { EnrollModule } from '../enroll/enroll.module';
import { NotificationModule } from 'src/notification/notification.module';
import EnrollmentSchema from 'src/schema/enroll.schema';
import CourseSchema from 'src/schema/course.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Discussion', schema: DiscussionSchema },
      { name: 'Course', schema: CourseSchema },
      { name: 'Enrollment', schema: EnrollmentSchema },
      { name: 'User', schema: UserSchema },
    ]),
    EnrollModule,
    NotificationModule,
  ],
  controllers: [DiscussionController],
  providers: [DiscussionService],
  exports: [DiscussionService],
})
export class DiscussionModule {}
