import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @IsOptional()
  @IsString()
  photoImg?: string;
}
