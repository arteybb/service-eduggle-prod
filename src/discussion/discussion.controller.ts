import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request, HttpException, HttpStatus, NotFoundException, BadRequestException } from '@nestjs/common';
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

  // Get all discussions for a course
  @Get('course/:courseId')
  async getCourseDiscussions(
    @Param('courseId') courseId: string,
    @Body('userId') userId?: string
  ) {
    // If userId is provided, check enrollment
    if (userId) {
      const isEnrolled = await this.enrollService.isEnrolled(userId, courseId);
      if (!isEnrolled) {
        throw new HttpException(
          'You must be enrolled in this course to view discussions',
          HttpStatus.FORBIDDEN
        );
      }
    }
    
    return this.discussionService.getCourseDiscussions(courseId);
  }

  // Get a single discussion by ID
  @Get(':id')
  async getDiscussionById(
    @Param('id') id: string,
    @Body('userId') userId?: string
  ) {
    const discussion = await this.discussionService.getDiscussionById(id);
    
    // If userId is provided, check enrollment
    if (userId) {
      const isEnrolled = await this.enrollService.isEnrolled(userId, discussion.courseId);
      if (!isEnrolled) {
        throw new HttpException(
          'You must be enrolled in this course to view this discussion',
          HttpStatus.FORBIDDEN
        );
      }
    }
    
    return discussion;
  }

  // Create a new discussion
  @Post()
  async createDiscussion(@Body() createDiscussionDto: CreateDiscussionDto) {
    try {
      // Check if the user is enrolled in the course
      const isEnrolled = await this.enrollService.isEnrolled(
        createDiscussionDto.userId,
        createDiscussionDto.courseId
      );

      if (!isEnrolled) {
        throw new HttpException(
          'You must be enrolled in this course to create discussions',
          HttpStatus.FORBIDDEN
        );
      }

      // If userName is not provided, fetch it from the user model
      if (!createDiscussionDto.userName) {
        // Find user by Firebase UID (stored in the 'uid' field, not '_id')
        const user = await this.userModel.findOne({ uid: createDiscussionDto.userId }).exec();
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        createDiscussionDto.userName = user.displayName || 'Anonymous User';
        createDiscussionDto.userPhotoURL = user.photoURL || null;
      }
      
      return this.discussionService.createDiscussion(createDiscussionDto);
    } catch (error) {
      console.error('Error creating discussion:', error);
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to create discussion',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Add a comment to a discussion
  @Post(':discussionId/comment')
  async addComment(
    @Param('discussionId') discussionId: string,
    @Body() createCommentDto: CreateCommentDto
  ) {
    try {
      // Get the discussion to find the courseId
      const discussion = await this.discussionService.getDiscussionById(discussionId);
      
      // Check if the user is enrolled in the course
      const isEnrolled = await this.enrollService.isEnrolled(
        createCommentDto.userId,
        discussion.courseId
      );

      if (!isEnrolled) {
        throw new HttpException(
          'You must be enrolled in this course to add comments',
          HttpStatus.FORBIDDEN
        );
      }

      // If userName is not provided, fetch it from the user model
      if (!createCommentDto.userName) {
        // Find user by Firebase UID (stored in the 'uid' field, not '_id')
        const user = await this.userModel.findOne({ uid: createCommentDto.userId }).exec();
        if (!user) {
          throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        createCommentDto.userName = user.displayName || 'Anonymous User';
        createCommentDto.userPhotoURL = user.photoURL || null;
      }
      
      return this.discussionService.addComment(discussionId, createCommentDto);
    } catch (error) {
      console.error('Error adding comment:', error);
      if (error instanceof NotFoundException || 
          error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Failed to add comment',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Delete a discussion
  @Delete(':id')
  async deleteDiscussion(
    @Param('id') id: string,
    @Body('userId') userId: string
  ) {
    return this.discussionService.deleteDiscussion(id, userId);
  }

  // Delete a comment
  @Delete(':discussionId/comment/:commentId')
  async deleteComment(
    @Param('discussionId') discussionId: string,
    @Param('commentId') commentId: string,
    @Body('userId') userId: string
  ) {
    return this.discussionService.deleteComment(discussionId, commentId, userId);
  }
} 