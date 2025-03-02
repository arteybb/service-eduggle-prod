import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectModel('Lesson') private readonly lessonModel: Model<any>,
    @InjectModel('Course') private readonly courseModel: Model<any>,
  ) {}

  async create(createLessonDto: CreateLessonDto) {
    const course = await this.courseModel
      .findById(createLessonDto.courseId)
      .exec();
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createLessonDto.courseId} not found`,
      );
    }

    const newLesson = new this.lessonModel(createLessonDto);
    const savedLesson = await newLesson.save();

    // เพิ่ม lesson ID ลงใน course
    course.lessons = course.lessons || [];
    course.lessons.push(savedLesson._id);
    await course.save();

    // ถ้ามีไฟล์อัปโหลด ให้แปลง mediaPath เป็น URL
    const lessonObj = savedLesson.toObject();
    if (lessonObj.mediaPath) {
      lessonObj.mediaUrl = `http://localhost:3000/uploads/media/${lessonObj.mediaPath}`;
    }

    return lessonObj;
  }

  async findByCourse(courseId: string) {
    const lessons = await this.lessonModel
      .find({ courseId })
      .sort({ order: 1 })
      .exec();

    return lessons.map((lesson) => {
      if (lesson.mediaPath) {
        lesson = lesson.toObject();
        lesson.mediaUrl = `http://localhost:3000/uploads/media/${lesson.mediaPath}`;
      }
      return lesson;
    });
  }

  async findById(id: string) {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    const lessonObj = lesson.toObject();
    if (lessonObj.mediaPath) {
      lessonObj.mediaUrl = `http://localhost:3000/uploads/media/${lessonObj.mediaPath}`;
    }

    return lessonObj;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto) {
    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateLessonDto, { new: true })
      .exec();

    if (!updatedLesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    const lessonObj = updatedLesson.toObject();
    if (lessonObj.mediaPath) {
      lessonObj.mediaUrl = `http://localhost:3000/uploads/media/${lessonObj.mediaPath}`;
    }

    return lessonObj;
  }

  async remove(id: string) {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    // Remove lesson from course
    await this.courseModel
      .updateOne({ _id: lesson.courseId }, { $pull: { lessons: id } })
      .exec();

    // Delete the lesson
    return this.lessonModel.findByIdAndDelete(id).exec();
  }
}
