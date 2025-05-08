import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  Patch,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/course.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `course-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async create(@Body() createCourseDto: CreateCourseDto, @UploadedFile() file) {
    if (file) {
      createCourseDto.imageName = file.filename;
    }
    return this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll() {
    return this.courseService.findAll();
  }

  @Get('teacher/:teacherId')
  async findByTeacher(@Param('teacherId') teacherId: string) {
    return this.courseService.findByTeacher(teacherId);
  }

  @Patch(':id/draft')
  async toggleDraft(@Param('id') id: string) {
    const course = await this.courseService.toggleDraft(id);
    return { success: true, isPublished: course.isPublished };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.courseService.findById(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `course-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: any,
    @UploadedFile() file,
  ) {
    if (file) {
      updateCourseDto.imageName = file.filename;
    }
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.courseService.remove(id);
  }

  @Put(':id/lessons/order')
  async updateLessonOrder(
    @Param('id') id: string,
    @Body() body: { lessonIds: string[] },
  ) {
    return this.courseService.updateLessonOrder(id, body.lessonIds);
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

  @Get(':courseId/enrolled-users')
  async getEnrolledUsers(@Param('courseId') courseId: string) {
    console.log('Received courseId:', courseId);
    return this.courseService.getEnrolledUsersByCourseId(courseId);
  }
}
