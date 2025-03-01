import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { CONSTANTS } from 'src/constant/constants.api';
import {
  CustomTokenResponse,
  SignInCustomTokenPayload,
  SignUpWithEmailPayload,
} from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import firebase from 'src/config/firebase-admin';
import admin from 'src/config/firebase-admin';
@Injectable()
export class AuthService {
  constructor(@InjectModel('user') private readonly userModel: Model<any>) {
    //
  }
  async generateCustomToken(
    payload: SignInCustomTokenPayload,
  ): Promise<CustomTokenResponse> {
    try {
      await firebase.auth().getUser(payload.uid);
      const customToken = await firebase.auth().createCustomToken(payload.uid);
      return {
        customToken,
      };
    } catch (error) {
      //
      throw new HttpException(
        {
          resCode: HttpStatus.NOT_FOUND,
          resDesc: 'user not exist.',
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async login(payload: { email: string }): Promise<any> {
    if (!payload.email) {
      throw new UnauthorizedException();
    }
    const user = await this.userModel.findOne({
      email: payload.email,
    });
    if (!user) {
      throw new HttpException(
        {
          resCode: HttpStatus.BAD_REQUEST,
          resDesc: CONSTANTS.USER_NOT_EXIST,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return user;
  }



  

  async register(payload: SignUpWithEmailPayload): Promise<any> {
    try {
      console.log(payload.uid);
      const createdUser = new this.userModel({
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName,
        photoImg: payload?.photoImg,
        photoURL: payload?.photoURL,
        role: 'M',
      });

      return await createdUser.save();
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
}
