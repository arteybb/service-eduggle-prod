import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import CourseSchema from 'src/schema/course.schema';
import { AssignmentSchema } from 'src/schema/assignment.schema';
import { EnrollModule } from 'src/enroll/enroll.module';
import { NotificationModule } from 'src/notification/notification.module';
import EnrollmentSchema from 'src/schema/enroll.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Course', schema: CourseSchema },
      { name: 'Assignment', schema: AssignmentSchema },
      { name: 'Enrollment', schema: EnrollmentSchema },
    ]),
    EnrollModule,
    NotificationModule,
  ],
  controllers: [AssignmentController],
  providers: [AssignmentService],
})
export class AssignmentModule {}
