import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/course.dto';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('create')
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll() {
    return this.courseService.findAll();
  }

  // ดึงข้อมูล Course โดยใช้ ID
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.courseService.findById(id);
  }
  @Post('enroll')
  async enrollUser(@Body() body: { userId: string; courseId: string }) {
    const { userId, courseId } = body;
    try {
      return await this.courseService.enrollUserInCourse(userId, courseId);
    } catch (error) {
      return { message: error.message };
    }
  }
}
