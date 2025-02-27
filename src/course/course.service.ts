import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('User') private readonly userModel: Model<any>,
  ) {}

  // ฟังก์ชันสำหรับสร้าง Course ใหม่
  async create(createCourseDto: any) {
    const newCourse = new this.courseModel(createCourseDto);
    return await newCourse.save();
  }

  // ฟังก์ชันสำหรับค้นหาทุก Course
  async findAll() {
    return this.courseModel.find().exec();
  }

  // ฟังก์ชันสำหรับค้นหา Course ตาม ID
  async findById(courseId: string) {
    return this.courseModel.findById(courseId).exec();
  }
  async enrollUserInCourse(userId: string, courseId: string) {
    // ค้นหาคอร์สตาม courseId
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new Error('Course not found');
    }

    // ค้นหาผู้ใช้ตาม userId
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    // // ตรวจสอบว่า user ได้ enroll ใน course นี้หรือยัง
    // if (user.enrolledCourses.includes(courseId)) {
    //   throw new Error('User is already enrolled in this course');
    // }

    // เพิ่ม courseId ไปยัง enrolledCourses ของ user
    user.enrolledCourses.push(courseId);
    await user.save();

    // คืนค่าข้อความที่สำเร็จ
    return { message: 'User successfully enrolled in course' };
  }
}
