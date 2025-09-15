export class CreateStudentProfileDto {
  fullName: string;
  dob: Date;
  email: string;
  gender?: string;
  class: string;
  section: string;
  rollNumber: string;
  guardianName: string;
  guardianContact: string;
  address?: string;
}