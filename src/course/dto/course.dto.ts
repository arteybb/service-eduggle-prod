export class CreateCourseDto {
  name: string;
  description?: string;
  imageName?: string;
  teacherId: string;
  lessons?: string[];
  isPublished?: boolean;
  price?: number;
}

export class UpdateCourseDto {
  name?: string;
  description?: string;
  imageName?: string;
  teacherId?: string;
  lessons?: string[];
  isPublished?: boolean;
  price?: number;
}

export class EnrollCourseDto {
  userId: string;
  courseId: string;
}
