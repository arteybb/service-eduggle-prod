export class CreateDiscussionDto {
    title: string;
    content: string;
    courseId: string;
    userId: string;
    userName?: string;
    userPhotoURL?: string;
  }
  
  export class CreateCommentDto {
    content: string;
    discussionId: string;
    userId: string;
    userName?: string;
    userPhotoURL?: string;
  } 