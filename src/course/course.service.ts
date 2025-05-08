import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
  ) {}

  async create(createCourseDto: any) {
    const newCourse = new this.courseModel(createCourseDto);
    const savedCourse = await newCourse.save();

    if (savedCourse.imageName) {
      savedCourse.imageUrl = `${process.env.BASE_URL}/uploads/images/${savedCourse.imageName}`;
    }

    return savedCourse;
  }

  async toggleDraft(id: string) {
    const course = await this.courseModel.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    course.isPublished = !course.isPublished;
    await course.save();
    return course;
  }

  async findAll() {
    const courses = await this.courseModel.find({ isPublished: true }).exec();
    return courses.map((course) => {
      if (course.imageName) {
        course = course.toObject();
        course.imageUrl = `${process.env.BASE_URL}/uploads/images/${course.imageName}`;
      }
      return course;
    });
  }

  async findById(courseId: string) {
    const course = await this.courseModel
      .findById(courseId)
      .populate('lessons')
      .exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const courseObj = course.toObject();

    if (courseObj.imageName) {
      courseObj.imageUrl = `${process.env.BASE_URL}/uploads/images/${courseObj.imageName}`;
    }

    return courseObj;
  }

  async findByTeacher(teacherId: string) {
    const courses = await this.courseModel.find({ teacherId }).exec();

    const coursesWithEnrollment = await Promise.all(
      courses.map(async (course) => {
        const courseObj = course.toObject();

        try {
          const enrollmentCount = await this.enrollmentModel.countDocuments({
            courseId: course._id,
            status: 'active',
          });

          courseObj.enrollmentCount = enrollmentCount;
        } catch (error) {
          console.error(
            `Error fetching enrollment count for course ${course._id}:`,
            error,
          );
          courseObj.enrollmentCount = 0;
        }

        if (courseObj.imageName) {
          courseObj.imageUrl = `${process.env.BASE_URL}/uploads/images/${courseObj.imageName}`;
        }

        return courseObj;
      }),
    );

    return coursesWithEnrollment;
  }

  async update(id: string, updateCourseDto: any) {
    const updatedCourse = await this.courseModel
      .findByIdAndUpdate(id, updateCourseDto, { new: true })
      .exec();

    if (!updatedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    const courseObj = updatedCourse.toObject();
    if (courseObj.imageName) {
      courseObj.imageUrl = `${process.env.BASE_URL}/uploads/images/${courseObj.imageName}`;
    }

    return courseObj;
  }

  async remove(id: string) {
    const deletedCourse = await this.courseModel.findByIdAndDelete(id).exec();

    if (!deletedCourse) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return deletedCourse;
  }

  async updateLessonOrder(courseId: string, lessonIds: string[]) {
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    course.lessons = lessonIds;
    return await course.save();
  }

  async enrollUserInCourse(userId: string, courseId: string) {
    const course = await this.courseModel.findById(courseId).exec();
    if (!course) {
      throw new Error('Course not found');
    }

    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new Error('User not found');
    }

    if (user.enrolledCourses && user.enrolledCourses.includes(courseId)) {
      throw new Error('User is already enrolled in this course');
    }

    if (!user.enrolledCourses) {
      user.enrolledCourses = [];
    }
    user.enrolledCourses.push(courseId);
    await user.save();

    return { message: 'User successfully enrolled in course' };
  }

  async getEnrolledUsersByCourseId(courseId: string) {
    // ค้นหาคอร์สเพื่อดึง teacherId
    const course = await this.courseModel.findById(courseId).exec();

    if (!course) {
      throw new Error('Course not found');
    }

    // ค้นหาผู้ลงทะเบียนที่มี courseId ตรงกับที่เรากำหนด
    const enrollments = await this.enrollmentModel
      .find({ courseId }) // ค้นหาผู้ที่ลงทะเบียนในคอร์สนี้
      .populate('userId', '_id displayName photoURL') // ดึงข้อมูลจาก User โดยใช้ populate
      .exec();

    // สร้าง array ที่จะเก็บข้อมูลผู้ใช้ที่ลงทะเบียน
    return {
      teacherId: course.teacherId, // ส่ง teacherId มาจาก course
      enrollment: enrollments.map((enrollment) => {
        return {
          _id: enrollment.userId._id,
          displayName: enrollment.userId.displayName, // ชื่อของผู้ใช้
          photoURL: enrollment.userId.photoURL, // รูปโปรไฟล์ของผู้ใช้
          enrollmentDate: enrollment.enrollmentDate, // วันที่ลงทะเบียน
        };
      }),
    };
  }
}
