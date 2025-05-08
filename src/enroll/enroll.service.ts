import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EnrollService {
  constructor(
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
  ) {}

  async enrollUser(userId: string, courseId: string) {
    const enrollment = new this.enrollmentModel({
      userId,
      courseId,
    });
    return await enrollment.save();
  }

  async isEnrolled(userId: string, courseId: string) {
    const enrollment = await this.enrollmentModel.findOne({
      userId,
      courseId,
      status: 'active',
    });
    return !!enrollment;
  }

  async getUserEnrollments(userId: string) {
    const enrollments = await this.enrollmentModel
      .find({
        userId,
        status: 'active',
      })
      .populate('courseId');

    return enrollments.map((enrollment) => enrollment.courseId);
  }

  async getCourseEnrollmentCount(courseId: string): Promise<number> {
    const count = await this.enrollmentModel.countDocuments({
      courseId,
      status: 'active',
    });
    return count;
  }

  async deleteEnrollmentByUid(uid: string, courseId: string): Promise<any> {
    try {
      // log เพื่อตรวจสอบค่า
      console.log(
        `Deleting enrollment with UID: ${uid} for courseId: ${courseId}`,
      );

      // ค้นหาการลงทะเบียนที่ตรงกับ uid และ courseId
      const enrollment = await this.enrollmentModel.findOneAndDelete({
        userId: uid, // ตรวจสอบว่า uid ตรงกับ userId ในฐานข้อมูล
        courseId: courseId, // ตรวจสอบว่า courseId ตรงกับคอร์สที่เลือก
      });

      if (!enrollment) {
        // ถ้าไม่พบการลงทะเบียน
        throw new Error('Enrollment not found');
      }

      return { message: 'Enrollment deleted successfully' };
    } catch (error) {
      console.error(`Error deleting enrollment: ${error.message}`);
      throw new Error(`Error deleting enrollment: ${error.message}`);
    }
  }
}
