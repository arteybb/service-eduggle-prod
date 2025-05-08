import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EnrollService } from './enroll.service';

@Controller('enroll')
export class EnrollController {
  constructor(private readonly enrollService: EnrollService) {}

  @Post('')
  async enroll(@Body() enrollDto: { userId: string; courseId: string }) {
    const isAlreadyEnrolled = await this.enrollService.isEnrolled(
      enrollDto.userId,
      enrollDto.courseId,
    );

    if (isAlreadyEnrolled) {
      return { message: 'User is already enrolled in this course.' };
    }

    // หากยังไม่ enroll ให้ enroll ผู้ใช้
    const result = await this.enrollService.enrollUser(
      enrollDto.userId,
      enrollDto.courseId,
    );
    return { message: 'Successfully enrolled in the course.', data: result };
  }

  @Get('user/:userId/courses')
  async getUserEnrollments(@Param('userId') userId: string) {
    return this.enrollService.getUserEnrollments(userId);
  }

  @Get('course/:courseId/count')
  async getCourseEnrollmentCount(@Param('courseId') courseId: string) {
    const count = await this.enrollService.getCourseEnrollmentCount(courseId);
    return { count };
  }

  @Delete(':courseId/:uid')
  async deleteEnrollment(
    @Param('courseId') courseId: string,
    @Param('uid') uid: string,
  ) {
    return this.enrollService.deleteEnrollmentByUid(uid, courseId);
  }
}
