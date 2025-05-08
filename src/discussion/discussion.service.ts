import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDiscussionDto, CreateCommentDto } from './dto/discussion.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('Discussion') private readonly discussionModel: Model<any>,
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
    private readonly notificationService: NotificationService,
  ) {}

  async getCourseDiscussions(courseId: string) {
    try {
      return await this.discussionModel
        .find({ courseId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      console.error('Error fetching course discussions:', error);
      throw new InternalServerErrorException('Failed to fetch discussions');
    }
  }

  async getDiscussionById(discussionId: string) {
    try {
      const discussion = await this.discussionModel
        .findById(discussionId)
        .exec();
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

  async createDiscussion(createDiscussionDto: CreateDiscussionDto) {
    try {
      const newDiscussion = new this.discussionModel({
        ...createDiscussionDto,
        comments: [],
        createdAt: new Date(),
      });
      await newDiscussion.save();

      const course = await this.courseModel
        .findById(createDiscussionDto.courseId)
        .select('name')
        .lean<{ _id: string; name: string }>();
      if (!course) {
        throw new InternalServerErrorException('Course not found');
      }
      const enrolledUsers = await this.enrollmentModel
        .find({ courseId: createDiscussionDto.courseId }, 'userId')
        .lean();
      const userIds = enrolledUsers
        .map((e) => e.userId.toString())
        .filter((userId) => userId !== createDiscussionDto.userId);
      if (userIds.length > 0) {
        await this.notificationService.createNotification(
          userIds,
          `${course.name}: New Discussion`,
          createDiscussionDto.title,
          `/courses/${createDiscussionDto.courseId}/lesson?tab=discussion`,
        );
      }

      return newDiscussion;
    } catch (error) {
      console.error('Error creating discussion:', error);
      throw new InternalServerErrorException('Failed to create discussion');
    }
  }

  async addComment(discussionId: string, createCommentDto: CreateCommentDto) {
    try {
      const discussion = await this.discussionModel
        .findById(discussionId)
        .exec();
      if (!discussion) {
        throw new NotFoundException('Discussion not found');
      }

      const newComment = {
        content: createCommentDto.content,
        userId: createCommentDto.userId,
        displayName: createCommentDto.displayName,
        userPhotoURL: createCommentDto.userPhotoURL,
        createdAt: new Date(),
      };

      discussion.comments.push(newComment);
      await discussion.save();

      return discussion.comments[discussion.comments.length - 1];
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error adding comment:', error);
      throw new InternalServerErrorException('Failed to add comment');
    }
  }

  async deleteDiscussion(discussionId: string, userId: string) {
    try {
      const discussion = await this.discussionModel
        .findById(discussionId)
        .exec();
      if (!discussion) {
        throw new NotFoundException('Discussion not found');
      }

      // console.log('dis', discussion.userId);
      // const userIdObj = new Types.ObjectId(userId);
      // console.log('userObj', userIdObj)
      // if (discussion.userId !== userIdObj) {
      //   throw new BadRequestException(
      //     'You are not authorized to delete this discussion',
      //   );
      // }

      await this.discussionModel.findByIdAndDelete(discussionId).exec();
      return { success: true };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error deleting discussion:', error);
      throw new InternalServerErrorException('Failed to delete discussion');
    }
  }

  async deleteComment(discussionId: string, commentId: string, userId: string) {
    try {
      const discussion = await this.discussionModel
        .findById(discussionId)
        .exec();
      if (!discussion) {
        throw new NotFoundException('Discussion not found');
      }

      const commentIndex = discussion.comments.findIndex(
        (comment) => comment._id.toString() === commentId,
      );

      if (commentIndex === -1) {
        throw new NotFoundException('Comment not found');
      }

      // // Check if the user is the creator of the comment
      // if (discussion.comments[commentIndex].userId !== userId) {
      //   throw new BadRequestException(
      //     'You are not authorized to delete this comment',
      //   );
      // }

      // Remove the comment
      discussion.comments.splice(commentIndex, 1);
      await discussion.save();

      return { success: true };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error deleting comment:', error);
      throw new InternalServerErrorException('Failed to delete comment');
    }
  }
}
