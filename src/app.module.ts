import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { EnrollModule } from './enroll/enroll.module';
import { DiscussionModule } from './discussion/discussion.module';
import { LessonModule } from './lesson/lesson.module';
import { QuizModule } from './quiz/quiz.module';
import { AssignmentModule } from './assignment/assignment.module';
import { NotificationModule } from './notification/notification.module';
import { FeedbackModule } from './feedback/feedback.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        console.log('MONGODB_URI:', uri);
        if (!uri) {
          throw new Error('MONGODB_URI is not defined in .env');
        }
        return { uri };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    CourseModule,
    EnrollModule,
    DiscussionModule,
    LessonModule,
    QuizModule,
    AssignmentModule,
    NotificationModule,
    FeedbackModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
