import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import UserSchema from 'src/schema/user.schema';
import { MulterModule } from '@nestjs/platform-express/multer';

@Module({
  controllers: [UserController],
  imports: [MongooseModule.forFeature([{ name: 'user', schema: UserSchema }])],
  providers: [UserService],
})
export class UserModule {}
