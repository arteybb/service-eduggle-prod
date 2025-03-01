import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDiscussionDto, CreateCommentDto } from './dto/discussion.dto';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectModel('Discussion') private readonly discussionModel: Model<any>,
  ) {}

  // Get all discussions for a course
  async getCourseDiscussions(courseId: string) {
    try {
      return await this.discussionModel.find({ courseId }).sort({ createdAt: -1 }).exec();
    } catch (error) {
      console.error('Error fetching course discussions:', error);
      throw new InternalServerErrorException('Failed to fetch discussions');
    }
  }

  // Get a single discussion by ID
  async getDiscussionById(discussionId: string) {
    try {
      const discussion = await this.discussionModel.findById(discussionId).exec();
      if (!discussion) {
        throw new NotFoundException('Discussion not found');
      }
      return discussion;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error fetching discussion:', error);
      throw new InternalServerErrorException('Failed to fetch discussion');
    }
  }

  // Create a new discussion
  async createDiscussion(createDiscussionDto: CreateDiscussionDto) {
    try {
      const newDiscussion = new this.discussionModel({
        ...createDiscussionDto,
        comments: [],
        createdAt: new Date()
      });
      return await newDiscussion.save();
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw new InternalServerErrorException('Failed to create discussion');
    }
  }

  // Add a comment to a discussion
  async addComment(discussionId: string, createCommentDto: CreateCommentDto) {
    try {
      const discussion = await this.discussionModel.findById(discussionId).exec();
      if (!discussion) {
        throw new NotFoundException('Discussion not found');
      }

      const newComment = {
        content: createCommentDto.content,
        userId: createCommentDto.userId,
        userName: createCommentDto.userName,
        userPhotoURL: createCommentDto.userPhotoURL,
        createdAt: new Date()
      };

      discussion.comments.push(newComment);
      await discussion.save();

      // Return the newly created comment
      return discussion.comments[discussion.comments.length - 1];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding comment:', error);
      throw new InternalServerErrorException('Failed to add comment');
    }
  }

  // Delete a discussion (only for the creator or admin)
  async deleteDiscussion(discussionId: string, userId: string) {
    try {
      const discussion = await this.discussionModel.findById(discussionId).exec();
      if (!discussion) {
        throw new NotFoundException('Discussion not found');
      }

      // Check if the user is the creator of the discussion
      if (discussion.userId !== userId) {
        throw new BadRequestException('You are not authorized to delete this discussion');
      }

      await this.discussionModel.findByIdAndDelete(discussionId).exec();
      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting discussion:', error);
      throw new InternalServerErrorException('Failed to delete discussion');
    }
  }

  // Delete a comment (only for the creator or admin)
  async deleteComment(discussionId: string, commentId: string, userId: string) {
    try {
      const discussion = await this.discussionModel.findById(discussionId).exec();
      if (!discussion) {
        throw new NotFoundException('Discussion not found');
      }

      // Find the comment
      const commentIndex = discussion.comments.findIndex(
        (comment) => comment._id.toString() === commentId
      );

      if (commentIndex === -1) {
        throw new NotFoundException('Comment not found');
      }

      // Check if the user is the creator of the comment
      if (discussion.comments[commentIndex].userId !== userId) {
        throw new BadRequestException('You are not authorized to delete this comment');
      }

      // Remove the comment
      discussion.comments.splice(commentIndex, 1);
      await discussion.save();

      return { success: true };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error deleting comment:', error);
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }
} 