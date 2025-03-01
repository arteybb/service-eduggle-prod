import { Module } from '@nestjs/common';
import { DiscussionService } from './discussion.service';
import { DiscussionController } from './discussion.controller';

@Module({
  controllers: [DiscussionController],
  providers: [DiscussionService],
})
export class DiscussionModule {}
