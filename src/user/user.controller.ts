import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  Put,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateProfileDto } from './dto/user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':uid')
  async findOne(@Param('uid') uid: string) {
    const user = await this.userService.findOne(uid);
    if (!user) {
      throw new NotFoundException(`User with uid ${uid} not found`);
    }
    return user;
  }

  @Get(':uid/enrolled-courses')
  async getEnrolledCourses(@Param('uid') uid: string) {
    return this.userService.getEnrolledCourses(uid);
  }

  @Put('edit/:uid')
  @UseInterceptors(
    FileInterceptor('photoImg', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const filename = `${Date.now()}-${file.originalname}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async updateUserProfile(
    @Param('uid') uid: string,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateProfileDto.photoImg = file.filename;
    }

    return this.userService.updateUser(uid, updateProfileDto);
  }
}
