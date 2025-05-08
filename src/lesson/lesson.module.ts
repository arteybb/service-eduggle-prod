import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LessonController } from './lesson.controller';
import { LessonService } from './lesson.service';
import LessonSchema from '../schema/lesson.schema';
import CourseSchema from '../schema/course.schema';
import { NotificationModule } from 'src/notification/notification.module';
import EnrollmentSchema from 'src/schema/enroll.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Lesson', schema: LessonSchema },
      { name: 'Enrollment', schema: EnrollmentSchema },
      { name: 'Course', schema: CourseSchema },
    ]),
    NotificationModule,
  ],

  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
