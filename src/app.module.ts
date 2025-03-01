import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CourseModule } from './course/course.module';
import { EnrollModule } from './enroll/enroll.module';
import { DiscussionModule } from './discussion/discussion.module';
import { LessonModule } from './lesson/lesson.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://aphuwakorn2:peatorart1@educraft.nerh8.mongodb.net/educraft',
    ),
    AuthModule,
    UserModule,
    CourseModule,
    EnrollModule,
    DiscussionModule,
    LessonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
