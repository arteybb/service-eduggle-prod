import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel('Quiz') private readonly quizModel: Model<any>,
    @InjectModel('Course') private readonly courseModel: Model<any>,
  ) {}

  async create(createQuizDto: CreateQuizDto) {
    // Check if course exists
    const course = await this.courseModel.findById(createQuizDto.courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${createQuizDto.courseId} not found`);
    }

    // Create new quiz
    const newQuiz = new this.quizModel(createQuizDto);
    const savedQuiz = await newQuiz.save();

    // Add quiz to course
    if (!course.quizzes) {
      course.quizzes = [];
    }
    course.quizzes.push(savedQuiz._id);
    await course.save();

    return savedQuiz;
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
    await this.courseModel.updateOne(
      { _id: quiz.courseId },
      { $pull: { quizzes: id } }
    ).exec();

    // Delete the quiz
    return this.quizModel.findByIdAndDelete(id).exec();
  }
} 