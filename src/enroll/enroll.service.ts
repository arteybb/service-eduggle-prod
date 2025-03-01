import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EnrollService {
  constructor(
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
  ) {}

  async enrollUser(uid: string, courseId: string) {
    const enrollment = new this.enrollmentModel({
      uid,
      courseId,
    });
    return await enrollment.save();
  }

  async isEnrolled(uid: string, courseId: string) {
    const enrollment = await this.enrollmentModel.findOne({
      uid,
      courseId,
      status: 'active',
    });
    return !!enrollment;
  }

  async getUserEnrollments(uid: string) {
    const enrollments = await this.enrollmentModel
      .find({
        uid,
        status: 'active',
      })
      .populate('courseId');

    return enrollments.map((enrollment) => enrollment.courseId);
  }
}
