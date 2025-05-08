import { Body, Controller, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './feedback.dto';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('submit')
  async submitFeedback(@Body() createFeedbackDto: CreateFeedbackDto) {
    return await this.feedbackService.createFeedback(createFeedbackDto);
  }
}
