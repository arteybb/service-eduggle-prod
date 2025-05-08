export class QuestionDto {
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export class CreateQuizDto {
  title: string;
  description?: string;
  courseId: string;
  questions: QuestionDto[];
  timeLimit?: number;
  passingScore?: number;
}

export class UpdateQuizDto {
  title?: string;
  description?: string;
  courseId?: string;
  questions?: QuestionDto[];
  timeLimit?: number;
  passingScore?: number;
} 