import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
  Query,
  Req,
  InternalServerErrorException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { AssignmentService } from './assignment.service';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateSubmissionDto,
  GradeSubmissionDto,
} from './dto/assignment.dto';

@Controller('assignment')
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @Post('')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          try {
            const { courseId } = req.body;
            if (!courseId) {
              return cb(new Error('courseId is required'), '');
            }

            const uploadPath = `./uploads/courses/${courseId}/assignments`;
            if (!existsSync(uploadPath)) {
              mkdirSync(uploadPath, { recursive: true });
            }

            cb(null, uploadPath);
          } catch (error) {
            cb(error, '');
          }
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${uniqueSuffix}-${file.originalname}`);
        },
      }),
    }),
  )
  async createAssignment(
    @Body() createAssignmentDto: CreateAssignmentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    try {
      if (!createAssignmentDto.courseId) {
        throw new Error('courseId is missing');
      }

      if (files && files.length > 0) {
        createAssignmentDto.attachments = files.map((file) => ({
          filename: file.filename,
          originalname: file.originalname,
          fileUrl: `/uploads/courses/${createAssignmentDto.courseId}/assignments/${file.filename}`,
        }));
      }

      return await this.assignmentService.create(createAssignmentDto);
    } catch (error) {
      console.error('Error uploading assignment files:', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('course/:id')
  findByCourse(@Param('id') id: string) {
    return this.assignmentService.findByCourse(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const courseId = req.body.courseId; // ตรวจสอบว่า courseId มาจาก body
          if (!courseId) {
            return cb(new Error('courseId is missing'), '');
          }

          const uploadPath = `./uploads/courses/${courseId}/assignments`;
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files && files.length > 0) {
      const courseId = updateAssignmentDto.courseId; // ใช้ courseId จาก body
      updateAssignmentDto.attachments = files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        fileUrl: `/uploads/courses/${courseId}/assignments/${file.filename}`,
      }));
    }

    return this.assignmentService.update(id, updateAssignmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.assignmentService.remove(id);
  }

  @Post(':id/submit')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const assignmentId = req.params.id;
          const userId = req.body.userId;
          const uploadPath = `./uploads/assignments/${assignmentId}/submissions/${userId}`;

          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
          }

          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  submitAssignment(
    @Param('id') id: string,
    @Body() submissionData: CreateSubmissionDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    if (files && files.length > 0) {
      const userId = submissionData.userId;
      submissionData.files = files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        fileUrl: `/uploads/assignments/${id}/submissions/${userId}/${file.filename}`,
      }));
    }

    return this.assignmentService.submitAssignment(id, submissionData);
  }

  @Get(':id/submissions')
  getSubmissions(@Param('id') id: string) {
    return this.assignmentService.getSubmissions(id);
  }

  @Get(':id/submissions/:userId')
  getStudentSubmission(
    @Param('id') id: string,
    @Param('userId') userId: string,
  ) {
    return this.assignmentService.getStudentSubmission(id, userId);
  }

  @Post(':id/grade')
  gradeSubmission(
    @Param('id') id: string,
    @Body() gradeData: GradeSubmissionDto,
  ) {
    return this.assignmentService.gradeSubmission(id, gradeData);
  }
}
