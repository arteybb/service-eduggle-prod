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
} from '@nestjs/common';
import { LessonService } from './lesson.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('lesson')
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Post('create')
  @UseInterceptors(
    FileInterceptor('mediaPath', {
      storage: diskStorage({
        destination: './uploads/media',
        filename: (req, file, callback) => {
          const filename = `${Date.now()}-${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async createLesson(
    @Body() createLessonDto: CreateLessonDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log('Received file:', file);
    console.log('Received body:', createLessonDto);

    // ถ้ามีไฟล์ ให้เพิ่ม mediaPath
    if (file) {
      createLessonDto.mediaPath = file.filename;
    }

    return this.lessonService.create(createLessonDto);
  }

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string) {
    return this.lessonService.findByCourse(courseId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.lessonService.findById(id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('media', {
      storage: diskStorage({
        destination: './uploads/media',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `lesson-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @UploadedFile() file,
  ) {
    if (file) {
      updateLessonDto.mediaPath = file.filename;
    }
    return this.lessonService.update(id, updateLessonDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.lessonService.remove(id);
  }
}
