import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './entities/user.entity';
import { UpdateProfileDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('user') private readonly userModel: Model<any>) {
    //
  }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return this.userModel.find().exec();
  }

  findOne(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async updateUser(
    userId: string,
    updateProfileDto: UpdateProfileDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const objectIdUserId = new Types.ObjectId(userId); // แปลง userId เป็น ObjectId

    if (file) {
      // เก็บชื่อไฟล์ในฐานข้อมูล
      updateProfileDto.photoImg = file.filename;
    }

    // อัปเดตข้อมูลในฐานข้อมูล
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { _id: objectIdUserId },
        { $set: updateProfileDto },
        { new: true },
      )
      .exec();

    console.log(updateProfileDto.displayName);
    console.log(updatedUser);
    // สร้าง URL สำหรับไฟล์ที่อัปโหลด
    if (updatedUser && updatedUser.photoImg) {
      updatedUser.photoImg = `http://localhost:3000/uploads/${updatedUser.photoImg}`;
    }

    return updatedUser;
  }
}
