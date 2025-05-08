import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { NotificationService } from 'src/notification/notification.service';
@Injectable()
export class LessonService {
  constructor(
    @InjectModel('Lesson') private readonly lessonModel: Model<any>,
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
    private readonly notificationService: NotificationService,
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
    console.log(course)
    const newLesson = new this.lessonModel(createLessonDto);
    const savedLesson = await newLesson.save();

    course.lessons = course.lessons || [];
    course.lessons.push(savedLesson._id);
    await course.save();

   
    const lessonObj = savedLesson.toObject();
    if (lessonObj.mediaPath) {
      lessonObj.mediaUrl = `${process.env.BASE_URL}/uploads/media/${lessonObj.mediaPath}`;
    }

    const enrolledUsers = await this.enrollmentModel
      .find({ courseId: createLessonDto.courseId }, 'userId')
      .lean();
    const userIds = enrolledUsers
      .map((e) => e.userId.toString())
      .filter((userId) => userId !== createLessonDto.courseId);

    if (userIds.length > 0) {
      await this.notificationService.createNotification(
        userIds,
        `${course.name}: New Lesson`,
        `${createLessonDto.title}`,
        `/courses/${createLessonDto.courseId}/lesson?tab=lesson`,
      );
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
        lesson.mediaUrl = `${process.env.BASE_URL}/uploads/media/${lesson.mediaPath}`;
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
      lessonObj.mediaUrl = `${process.env.BASE_URL}/uploads/media/${lessonObj.mediaPath}`;
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
      lessonObj.mediaUrl = `${process.env.BASE_URL}/uploads/media/${lessonObj.mediaPath}`;
    }

    return lessonObj;
  }

  async remove(id: string) {
    const lesson = await this.lessonModel.findById(id).exec();
    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    await this.courseModel
      .updateOne({ _id: lesson.courseId }, { $pull: { lessons: id } })
      .exec();

    return this.lessonModel.findByIdAndDelete(id).exec();
  }
}
