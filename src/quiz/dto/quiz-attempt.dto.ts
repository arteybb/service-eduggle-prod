export class CreateQuizAttemptDto {
  quizId: string;
  userId: string;
  answers: number[];
  timeSpent: number;
  score: number;
} 