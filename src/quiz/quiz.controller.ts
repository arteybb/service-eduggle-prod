import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  NotFoundException,
  Patch,
} from '@nestjs/common';
import { QuizService } from './quiz.service';
import { CreateQuizDto, UpdateQuizDto } from './dto/quiz.dto';
import { CreateQuizAttemptDto } from './dto/quiz-attempt.dto';

@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get(':courseId/:quizId/status')
  async getUsersQuizStatus(
    @Param('courseId') courseId: string,
    @Param('quizId') quizId: string,
  ) {
    try {
      const result = await this.quizService.getUsersQuizStatus(
        courseId,
        quizId,
      );
      return result;
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Post('create')
  async create(@Body() createQuizDto: CreateQuizDto) {
    return this.quizService.create(createQuizDto);
  }

  @Get('course/:courseId')
  async findByCourse(@Param('courseId') courseId: string) {
    return this.quizService.findByCourse(courseId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.quizService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateQuizDto: UpdateQuizDto) {
    return this.quizService.update(id, updateQuizDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.quizService.remove(id);
  }

  @Post('attempt')
  async submitQuizAttempt(@Body() createQuizAttemptDto: CreateQuizAttemptDto) {
    return this.quizService.submitQuizAttempt(createQuizAttemptDto);
  }

  @Get(':id/attempts')
  async getQuizAttempts(@Param('id') quizId: string) {
    return this.quizService.getQuizAttempts(quizId);
  }

  @Get('attempts/user/:userId')
  async getUserQuizAttempts(@Param('userId') userId: string) {
    return this.quizService.getUserQuizAttempts(userId);
  }

  @Patch(':id/draft')
  async toggleDraft(@Param('id') id: string) {
    const quiz = await this.quizService.toggleDraft(id);
    return { success: true, draft: quiz.draft };
  }
}
