import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('Assignment') private readonly assignmentModel: Model<any>,
  ) {}
  async create(createAssignmentDto: any){
    const course = await this.courseModel
      .findById(createAssignmentDto.courseId)
      .exec();
    if (!course) {
      throw new NotFoundException(
        `Course with ID ${createAssignmentDto.courseId} not found`,
      );
    }

    const newAssignment = new this.assignmentModel(createAssignmentDto);
    const savedAssignment = await newAssignment.save();

    // เพิ่ม assignment ID ลงใน course
    course.assignments = course.assignments || [];
    course.assignments.push(savedAssignment._id);
    await course.save();

    // ถ้ามีไฟล์อัปโหลด ให้แปลง filePath เป็น URL
    const assignmentObj = savedAssignment.toObject();
    if (assignmentObj.filePath) {
      assignmentObj.fileUrl = `http://localhost:3000/uploads/assignments/${assignmentObj.filePath}`;
    }

    return assignmentObj;
  }

  findAll() {
    return `This action returns all assignment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} assignment`;
  }

  update(id: number, updateAssignmentDto: UpdateAssignmentDto) {
    return `This action updates a #${id} assignment`;
  }

  remove(id: number) {
    return `This action removes a #${id} assignment`;
  }
}
