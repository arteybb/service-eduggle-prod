import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import CourseSchema from '../schema/course.schema';
import UserSchema from '../schema/user.schema';
import EnrollSchema from '../schema/enroll.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Course', schema: CourseSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Enrollment', schema: EnrollSchema },
    ]),
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
