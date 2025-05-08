import { IsString, IsOptional, IsDateString, IsArray, ValidateNested, IsNumber, Min, Max, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

// Attachment DTO
export class AttachmentDto {
  @IsString()
  filename: string;

  @IsString()
  originalname: string;

  @IsString()
  fileUrl: string;
}

// Create Assignment DTO
export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  courseId: string;

  @IsString()
  teacherId: string;

  @IsString()
  teacherName: string;

  @IsString()
  @IsOptional()
  teacherPhotoURL?: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @IsDateString()
  dueDate?: string;

  @IsString()
  filename: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  @IsOptional()
  attachments?: AttachmentDto[];

  @IsOptional()
  @IsString()
  keepExistingAttachments?: string;
}

// Update Assignment DTO
export class UpdateAssignmentDto extends PartialType(CreateAssignmentDto) {}

// Submission File DTO
export class SubmissionFileDto {
  @IsString()
  filename: string;

  @IsString()
  originalname: string;

  @IsString()
  fileUrl: string;
}

// Create Submission DTO
export class CreateSubmissionDto {
  @IsString()
  userId: string;

  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  userPhotoURL?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubmissionFileDto)
  @IsOptional()
  files?: SubmissionFileDto[];

  @IsOptional()
  @IsString()
  keepExistingFiles?: string;
}

// Grade Submission DTO
export class GradeSubmissionDto {
  @IsString()
  userId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  grade: number;

  @IsOptional()
  @IsString()
  feedback?: string;

  @IsOptional()
  @IsBoolean()
  isGraded?: boolean;
}
