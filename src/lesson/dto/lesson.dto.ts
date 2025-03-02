export class CreateLessonDto {
  title: string;
  description?: string;
  mediaPath?: string;
  courseId: string;
  order?: number;
  content?: string;
}

export class UpdateLessonDto {
  title?: string;
  description?: string;
  mediaPath?: string;
  courseId?: string;
  order?: number;
  content?: string;
} 