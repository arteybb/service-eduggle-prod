import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import QuizSchema from '../schema/quiz.schema';
import CourseSchema from '../schema/course.schema';
import QuizAttemptSchema from '../schema/quiz-attempt.schema';
import UserSchema from 'src/schema/user.schema';
import EnrollmentSchema from 'src/schema/enroll.schema';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Quiz', schema: QuizSchema },
      { name: 'Course', schema: CourseSchema },
      { name: 'QuizAttempt', schema: QuizAttemptSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Enrollment', schema: EnrollmentSchema },
    ]),
    NotificationModule,
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService],
})
export class QuizModule {} 