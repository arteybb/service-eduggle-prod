import { Injectable } from '@nestjs/common';
import { CreateFeedbackDto } from './feedback.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectModel('Feedback') private readonly feedbackModel: Model<any>,
  ) {}
  async createFeedback(createFeedbackDto: CreateFeedbackDto) {
    const createdFeedback = new this.feedbackModel(createFeedbackDto);
    return await createdFeedback.save();
  }
}
