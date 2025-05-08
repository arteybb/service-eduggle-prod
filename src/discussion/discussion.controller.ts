import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { CreateDiscussionDto, CreateCommentDto } from './dto/discussion.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EnrollService } from '../enroll/enroll.service';

@Controller('discussion')
export class DiscussionController {
  constructor(
    private readonly discussionService: DiscussionService,
    @InjectModel('User') private readonly userModel: Model<any>,
    private readonly enrollService: EnrollService,
  ) {}

  @Get('course/:courseId')
  async getCourseDiscussions(
    @Param('courseId') courseId: string,
    @Body('userId') userId?: string,
  ) {
    if (userId) {
      const isEnrolled = await this.enrollService.isEnrolled(userId, courseId);
      if (!isEnrolled) {
        throw new HttpException(
          'You must be enrolled in this course to view discussions',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return this.discussionService.getCourseDiscussions(courseId);
  }

  @Get(':id')
  async getDiscussionById(
    @Param('id') id: string,
    @Body('userId') userId?: string,
  ) {
    const discussion = await this.discussionService.getDiscussionById(id);

    if (userId) {
      const isEnrolled = await this.enrollService.isEnrolled(
        userId,
        discussion.courseId,
      );
      if (!isEnrolled) {
        throw new HttpException(
          'You must be enrolled in this course to view this discussion',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return discussion;
  }

  @Post()
  async createDiscussion(@Body() createDiscussionDto: CreateDiscussionDto) {
    try {
      // const isEnrolled = await this.enrollService.isEnrolled(
      //   createDiscussionDto.userId,
      //   createDiscussionDto.courseId,
      // );

      // if (!isEnrolled) {
      //   throw new HttpException(
      //     'You must be enrolled in this course to create discussions',
      //     HttpStatus.FORBIDDEN,
      //   );
      // }

      if (!createDiscussionDto.displayName) {
        const user = await this.userModel
          .findOne({ _id: createDiscussionDto.userId })
          .exec();
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        createDiscussionDto.displayName = user.displayName || 'Anonymous User';
      }

      return this.discussionService.createDiscussion(createDiscussionDto);
    } catch (error) {
      console.error('Error creating discussion:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create discussion',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post(':discussionId/comment')
  async addComment(
    @Param('discussionId') discussionId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    try {
      if (!createCommentDto.displayName) {
        const user = await this.userModel
          .findOne({ _id: createCommentDto.userId })
          .exec();
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        createCommentDto.displayName = user.displayName || 'Anonymous User';
      }

      return this.discussionService.addComment(discussionId, createCommentDto);
    } catch (error) {
      console.error('Error adding comment:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to add comment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteDiscussion(
    @Param('id') id: string,
    @Body('userId') userId: string,
  ) {
    return this.discussionService.deleteDiscussion(id, userId);
  }

  @Delete(':discussionId/comment/:commentId')
  async deleteComment(
    @Param('discussionId') discussionId: string,
    @Param('commentId') commentId: string,
    @Body('userId') userId: string,
  ) {
    return this.discussionService.deleteComment(
      discussionId,
      commentId,
      userId,
    );
  }
}
