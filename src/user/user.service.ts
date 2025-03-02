import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('user') private readonly userModel: Model<any>,
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
  ) {
    //
  }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.userModel.find().exec();
  }

  findOne(uid: string) {
    return this.userModel.findOne({ uid }).exec();
  }

  async getEnrolledCourses(uid: string) {
    const enrollments = await this.enrollmentModel
      .find({ uid, status: 'active' })
      .populate('courseId')
      .exec();
    
    return enrollments.map(enrollment => enrollment.courseId);
  }

  async updateUser(
    uid: string,
    updateProfileDto: UpdateProfileDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    if (file) {
      updateProfileDto.photoImg = file.filename;
    }

    const updatedUser = await this.userModel
      .findOneAndUpdate({ uid: uid }, { $set: updateProfileDto }, { new: true })
      .exec();

    console.log(updateProfileDto.displayName);
    console.log(updatedUser);
    if (updatedUser && updatedUser.photoImg) {
      updatedUser.photoImg = `http://localhost:3000/uploads/${updatedUser.photoImg}`;
    }

    return updatedUser;
  }
}
