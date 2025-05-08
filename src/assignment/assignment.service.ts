import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateAssignmentDto,
  UpdateAssignmentDto,
  CreateSubmissionDto,
  GradeSubmissionDto,
} from './dto/assignment.dto';
import { NotificationService } from 'src/notification/notification.service';

@Injectable()
export class AssignmentService {
  constructor(
    @InjectModel('Course') private readonly courseModel: Model<any>,
    @InjectModel('Enrollment') private readonly enrollmentModel: Model<any>,
    @InjectModel('Assignment') private assignmentModel: Model<any>,
    private readonly notificationService: NotificationService,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto): Promise<any> {
    const createdAssignment = new this.assignmentModel(createAssignmentDto);
    await createdAssignment.save();

    const course = await this.courseModel
      .findById(createAssignmentDto.courseId)
      .select('name')
      .lean<{ _id: string; name: string }>();
    if (!course) {
      throw new InternalServerErrorException('Course not found');
    }

    const enrolledUsers = await this.enrollmentModel
      .find({ courseId: createAssignmentDto.courseId }, 'userId')
      .lean();
    const userIds = enrolledUsers.map((e) => e.userId.toString());

    if (userIds.length > 0) {
      await this.notificationService.createNotification(
        userIds,
        `${course.name}: New Assignment`,
        createAssignmentDto.title,
        `/courses/${createAssignmentDto.courseId}/lesson?tab=assignments`,
      );
    }

    return createdAssignment;
  }

  async findByCourse(courseId: string): Promise<any[]> {
    return this.assignmentModel.find({ courseId }).exec();
  }

  async findOne(id: string): Promise<any> {
    const assignment = await this.assignmentModel.findById(id).exec();
    if (!assignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return assignment;
  }

  async update(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
  ): Promise<any> {
    const existingAssignment = await this.findOne(id);

    // Handle keeping existing attachments if specified
    if (
      updateAssignmentDto.keepExistingAttachments === 'true' &&
      updateAssignmentDto.attachments
    ) {
      updateAssignmentDto.attachments = [
        ...(existingAssignment.attachments || []),
        ...updateAssignmentDto.attachments,
      ];
    } else if (
      !updateAssignmentDto.attachments &&
      updateAssignmentDto.keepExistingAttachments === 'true'
    ) {
      // If no new attachments but keep existing is true, maintain existing attachments
      updateAssignmentDto.attachments = existingAssignment.attachments || [];
    }

    const updatedAssignment = await this.assignmentModel
      .findByIdAndUpdate(id, updateAssignmentDto, { new: true })
      .exec();

    if (!updatedAssignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }

    return updatedAssignment;
  }

  async remove(id: string): Promise<any> {
    const deletedAssignment = await this.assignmentModel
      .findByIdAndDelete(id)
      .exec();
    if (!deletedAssignment) {
      throw new NotFoundException(`Assignment with ID ${id} not found`);
    }
    return deletedAssignment;
  }

  async submitAssignment(
    id: string,
    submissionData: CreateSubmissionDto,
  ): Promise<any> {
    const assignment = await this.findOne(id);

    const existingSubmissionIndex = assignment.submissions?.findIndex(
      (sub) => sub.userId === submissionData.userId,
    );

    if (
      existingSubmissionIndex !== -1 &&
      existingSubmissionIndex !== undefined &&
      submissionData.keepExistingFiles === 'true' &&
      submissionData.files &&
      submissionData.files.length > 0
    ) {
      submissionData.files = [
        ...(assignment.submissions[existingSubmissionIndex].files || []),
        ...submissionData.files,
      ];
    } else if (
      existingSubmissionIndex !== -1 &&
      existingSubmissionIndex !== undefined &&
      submissionData.keepExistingFiles === 'true' &&
      (!submissionData.files || submissionData.files.length === 0)
    ) {
      submissionData.files =
        assignment.submissions[existingSubmissionIndex].files || [];
    }

    if (
      existingSubmissionIndex !== -1 &&
      existingSubmissionIndex !== undefined
    ) {
      assignment.submissions[existingSubmissionIndex] = {
        ...assignment.submissions[existingSubmissionIndex],
        ...submissionData,
        updatedAt: new Date(),
      };
    } else {
      if (!assignment.submissions) {
        assignment.submissions = [];
      }

      assignment.submissions.push({
        ...submissionData,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return this.assignmentModel
      .findByIdAndUpdate(id, assignment, { new: true })
      .exec();
  }

  async getSubmissions(id: string): Promise<any[]> {
    const assignment = await this.findOne(id);
    return assignment.submissions || [];
  }

  async getStudentSubmission(id: string, userId: string): Promise<any> {
    const assignment = await this.findOne(id);

    const submission = assignment.submissions?.find(
      (sub) => sub.userId === userId,
    );

    if (!submission) {
      return null;
    }

    return submission;
  }

  async gradeSubmission(
    id: string,
    gradeData: GradeSubmissionDto,
  ): Promise<any> {
    const assignment = await this.findOne(id);
    const { userId, grade, feedback, isGraded = true } = gradeData;

    const submissionIndex = assignment.submissions?.findIndex(
      (sub) => sub.userId === userId,
    );

    if (submissionIndex === -1 || submissionIndex === undefined) {
      throw new NotFoundException(`Submission for student ${userId} not found`);
    }

    const existingSubmission = assignment.submissions[submissionIndex];
    const updatedSubmission = {
      ...existingSubmission,
      grade,
      feedback,
      isGraded,
      gradedAt: new Date(),
      updatedAt: new Date(),
      userId: existingSubmission.userId,
      displayName: existingSubmission.displayName || 'Unknown Student',
      userPhotoURL: existingSubmission.userPhotoURL,
      files: existingSubmission.files || [],
      submittedAt: existingSubmission.submittedAt,
    };

    assignment.submissions[submissionIndex] = updatedSubmission;

    const updatedAssignment = await this.assignmentModel
      .findByIdAndUpdate(
        id,
        { $set: { submissions: assignment.submissions } },
        { new: true },
      )
      .exec();

    return updatedAssignment.submissions[submissionIndex];
  }
}
