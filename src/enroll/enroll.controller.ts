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
  async enroll(@Body() enrollDto: { uid: string; courseId: string }) {
    const isAlreadyEnrolled = await this.enrollService.isEnrolled(
      enrollDto.uid,
      enrollDto.courseId,
    );

    if (isAlreadyEnrolled) {
      return { message: 'User is already enrolled in this course.' };
    }

    // หากยังไม่ enroll ให้ enroll ผู้ใช้
    const result = await this.enrollService.enrollUser(
      enrollDto.uid,
      enrollDto.courseId,
    );
    return { message: 'Successfully enrolled in the course.', data: result };
  }

  @Get('user/:uid/courses')
  async getUserEnrollments(@Param('uid') uid: string) {
    return this.enrollService.getUserEnrollments(uid);
  }

  @Get('course/:courseId/count')
  async getCourseEnrollmentCount(@Param('courseId') courseId: string) {
    const count = await this.enrollService.getCourseEnrollmentCount(courseId);
    return { count };
  }
}
