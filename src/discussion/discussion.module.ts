import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiscussionController } from './discussion.controller';
import { DiscussionService } from './discussion.service';
import { DiscussionSchema } from '../schema/discussion.schema';
import UserSchema from '../schema/user.schema';
import { EnrollModule } from '../enroll/enroll.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Discussion', schema: DiscussionSchema },
      { name: 'User', schema: UserSchema }
    ]),
    EnrollModule
  ],
  controllers: [DiscussionController],
  providers: [DiscussionService],
  exports: [DiscussionService]
})
export class DiscussionModule {} 
