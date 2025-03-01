import { Module } from '@nestjs/common';
import { EnrollService } from './enroll.service';
import { EnrollController } from './enroll.controller';
import { MongooseModule } from '@nestjs/mongoose';
import EnrollmentSchema from 'src/schema/enroll.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Enrollment', schema: EnrollmentSchema },
    ]),
  ],
  controllers: [EnrollController],
  providers: [EnrollService],
  exports: [EnrollService],
})
export class EnrollModule {}
