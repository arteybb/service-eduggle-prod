import { Injectable, NotFoundException } from '@nestjs/common';
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
    const savedCourse = await newCourse.save();
    
    if (savedCourse.imageName) {
      savedCourse.imageUrl = `http://localhost:3000/uploads/images/${savedCourse.imageName}`;
    }
    
    return savedCourse;
  }

  // ฟังก์ชันสำหรับค้นหาทุก Course
  async findAll() {
    const courses = await this.courseModel.find().exec();
    return courses.map(course => {
      if (course.imageName) {
        course = course.toObject();
        course.imageUrl = `http://localhost:3000/uploads/images/${course.imageName}`;
      }
      return course;
    });
  }

  // ฟังก์ชันสำหรับค้นหา Course ตาม ID
  async findById(courseId: string) {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    
    const courseObj = course.toObject();
    if (courseObj.imageName) {
      courseObj.imageUrl = `http://localhost:3000/uploads/images/${courseObj.imageName}`;
    }
    
    return courseObj;
  }

  // ฟังก์ชันสำหรับค้นหา Course ตาม Teacher ID
  async findByTeacher(teacherId: string) {
    const courses = await this.courseModel.find({ teacherId }).exec();
    return courses.map(course => {
      if (course.imageName) {
        course = course.toObject();
        course.imageUrl = `http://localhost:3000/uploads/images/${course.imageName}`;
      }
      return course;
    });
  }

  // ฟังก์ชันสำหรับอัปเดต Course
  async update(id: string, updateCourseDto: any) {
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();
    
    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    const courseObj = updatedCourse.toObject();
    if (courseObj.imageName) {
      courseObj.imageUrl = `http://localhost:3000/uploads/images/${courseObj.imageName}`;
    }
    
    return courseObj;
  }

  // ฟังก์ชันสำหรับลบ Course
  async remove(id: string) {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();
    
    if (!deletedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return deletedCourse;
  }

  // ฟังก์ชันสำหรับอัปเดตลำดับบที่ของบทเรียน
  async updateLessonOrder(courseId: string, lessonIds: string[]) {
    const course = await this.courseModel.findById(courseId).exec();
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    
    course.lessons = lessonIds;
    return await course.save();
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

    // ตรวจสอบว่า user ได้ enroll ใน course นี้หรือยัง
    if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
      throw new Error('User is already enrolled in this course');
    }

    // เพิ่ม courseId ไปยัง enrolledCourses ของ user
    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }
    user.enrolledCourses.push(courseId);
    await user.save();

    // คืนค่าข้อความที่สำเร็จ
    return { message: 'User successfully enrolled in course' };
  }
}
