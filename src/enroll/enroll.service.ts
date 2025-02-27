import { Injectable } from '@nestjs/common';
import { CreateEnrollDto } from './dto/create-enroll.dto';
import { UpdateEnrollDto } from './dto/update-enroll.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EnrollService {
  constructor(
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
  ) {}

  // ฟังก์ชันสำหรับ enroll ผู้ใช้ใน course
  async enrollUser(userId: string, courseId: string) {
    const enrollment = new this.enrollmentModel({
      userId,
      courseId,
    });
    return await enrollment.save(); // บันทึกข้อมูลการ enroll
  }

  // ฟังก์ชันสำหรับตรวจสอบว่า user ได้ enroll ใน course หรือยัง
  async isEnrolled(userId: string, courseId: string) {
    const enrollment = await this.enrollmentModel.findOne({
      userId,
      courseId,
      status: 'active', // เช็คว่า enroll ยังอยู่
    });
    return !!enrollment; // คืนค่าจริงหาก enroll แล้ว
  }

  // ฟังก์ชันสำหรับดึงข้อมูลคอร์สทั้งหมดที่ user ได้ enroll
  async getUserEnrollments(userId: string) {
    const enrollments = await this.enrollmentModel
      .find({
        userId,
        status: 'active', // เช็คเฉพาะการ enroll ที่ยัง active อยู่
      })
      .populate('courseId'); // ใช้ populate ถ้าต้องการข้อมูลจากคอร์ส (เช่น ชื่อคอร์ส, รายละเอียด)

    return enrollments.map((enrollment) => enrollment.courseId); // คืนค่าข้อมูลคอร์สที่ user ได้ enroll
  }
}
