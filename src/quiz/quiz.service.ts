import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('Quiz') private readonly quizModel: Model<any>,
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('QuizAttempt') private readonly quizAttemptModel: Model<any>,
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
    private readonly notificationService: NotificationService,
  ) {}

  async getUsersQuizStatus(courseId: string, quizId: string) {
    try {
      const enrollments = await this.enrollmentModel
        .find({ courseId })
        .select('userId');
      const userIds = enrollments.map((enrollment) => enrollment.userId);

      const attemptedUsersData = await this.quizAttemptModel
        .find({ quizId, userId: { $in: userIds } })
        .select('userId score createdAt')
        .lean();

      const userScoreMap = new Map();
      attemptedUsersData.forEach((attempt) => {
        userScoreMap.set(attempt.userId.toString(), {
          score: attempt.score,
          timestamp: attempt.createdAt,
        });
      });

      const attemptedUsers = await this.userModel
        .find({ _id: { $in: Array.from(userScoreMap.keys()) } })
        .select('photoImg displayName');

      const attemptedUsersWithScore = attemptedUsers.map((user) => ({
        ...user.toObject(),
        score: userScoreMap.get(user._id.toString()).score,
        timestamp: userScoreMap.get(user._id.toString()).timestamp,
      }));

      const notAttemptedUsers = await this.userModel
        .find({ _id: { $nin: Array.from(userScoreMap.keys()), $in: userIds } })
        .select('photoImg displayName');

      return { attemptedUsers: attemptedUsersWithScore, notAttemptedUsers };
    } catch (error) {
      console.error(error);
      throw new Error('Error fetching users');
    }
  }

  async create(createQuizDto: CreateQuizDto) {
    const course = await this.courseModel
      .findById(createQuizDto.courseId)
      .exec();
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createQuizDto.courseId} not found`,
      );
    }

    const newQuiz = new this.quizModel(createQuizDto);
    const savedQuiz = await newQuiz.save();

    if (!course.quizzes) {
      course.quizzes = [];
    }
    course.quizzes.push(savedQuiz._id);
    await course.save();

    return savedQuiz;
  }

  async toggleDraft(id: string) {
    const quiz = await this.quizModel.findById(id);
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    quiz.draft = !quiz.draft;
    console.log(quiz.draft);

    await quiz.save();

    const course = await this.courseModel.findById(quiz.courseId).exec();
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const enrolledUsers = await this.enrollmentModel
      .find({ courseId: course._id }, 'userId')
      .lean();
    const userIds = enrolledUsers
      .map((e) => e.userId.toString())
      .filter((userId) => userId !== quiz.teacherId);

    const notificationMessage = quiz.title;

    if (quiz.draft) {
      await this.notificationService.createNotification(
        userIds,
        `${course.name}: New Quiz`,
        notificationMessage,
        `/courses/${course._id}/lesson?tab=quizzes`,
      );
    }

    return quiz;
  }

  async findByCourse(courseId: string) {
    return this.quizModel.find({ courseId }).exec();
  }

  async findById(id: string) {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }
    return quiz;
  }

  async update(id: string, updateQuizDto: UpdateQuizDto) {
    const updatedQuiz = await this.quizModel
      .findByIdAndUpdate(id, updateQuizDto, { new: true })
      .exec();

    if (!updatedQuiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    return updatedQuiz;
  }

  async remove(id: string) {
    const quiz = await this.quizModel.findById(id).exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${id} not found`);
    }

    // Remove quiz from course
    await this.courseModel
      .updateOne({ _id: quiz.courseId }, { $pull: { quizzes: id } })
      .exec();

    // Delete the quiz
    return this.quizModel.findByIdAndDelete(id).exec();
  }

  // Quiz Attempt Methods
  async submitQuizAttempt(createQuizAttemptDto: CreateQuizAttemptDto) {
    // Check if quiz exists
    const quiz = await this.quizModel
      .findById(createQuizAttemptDto.quizId)
      .exec();
    if (!quiz) {
      throw new NotFoundException(
        `Quiz with ID ${createQuizAttemptDto.quizId} not found`,
      );
    }

    // Validate answers
    if (createQuizAttemptDto.answers.length !== quiz.questions.length) {
      throw new BadRequestException(
        'Number of answers does not match number of questions',
      );
    }

    // Calculate if passed
    const passingScore = quiz.passingScore || 60; // Default passing score is 60%
    const passed = createQuizAttemptDto.score >= passingScore;

    // Check if user already has an attempt for this quiz
    const existingAttempt = await this.quizAttemptModel
      .findOne({
        quizId: createQuizAttemptDto.quizId,
        userId: createQuizAttemptDto.userId,
      })
      .exec();

    if (existingAttempt) {
      // Update existing attempt
      const updatedAttempt = await this.quizAttemptModel
        .findByIdAndUpdate(
          existingAttempt._id,
          {
            ...createQuizAttemptDto,
            passed,
          },
          { new: true },
        )
        .exec();
      return updatedAttempt;
    } else {
      // Create new attempt
      const newAttempt = new this.quizAttemptModel({
        ...createQuizAttemptDto,
        passed,
      });
      return newAttempt.save();
    }
  }

  async getQuizAttempts(quizId: string) {
    const quiz = await this.quizModel.findById(quizId).exec();
    if (!quiz) {
      throw new NotFoundException(`Quiz with ID ${quizId} not found`);
    }

    return this.quizAttemptModel.find({ quizId }).exec();
  }

  async getUserQuizAttempts(userId: string) {
    return this.quizAttemptModel.find({ userId }).populate('quizId').exec();
  }
}
