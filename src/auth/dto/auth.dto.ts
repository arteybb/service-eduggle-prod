import { IsNotEmpty, IsString } from 'class-validator';

export class SignInCustomTokenPayload {
  @IsString()
  @IsNotEmpty()
  uid: string;
}
export type CustomTokenResponse = {
  customToken: string;
};

export class SignUpWithEmailPayload {
  @IsString()
  @IsNotEmpty()
  uid: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsString()
  photoImg: string;

  @IsString()
  photoURL: string;
}

