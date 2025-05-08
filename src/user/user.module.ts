import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from 'src/schema/user.schema';
import CourseSchema from 'src/schema/course.schema';
import EnrollmentSchema from 'src/schema/enroll.schema';
import { MulterModule } from '@nestjs/platform-express/multer';

@Module({
  controllers: [UserController],
  imports: [
    MongooseModule.forFeature([
      { name: 'user', schema: UserSchema },
      { name: 'Course', schema: CourseSchema },
      { name: 'Enrollment', schema: EnrollmentSchema },
    ]),
  ],
  providers: [UserService],
})
export class UserModule {}
