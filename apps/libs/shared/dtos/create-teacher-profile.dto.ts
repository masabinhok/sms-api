export enum Subject {
  MATH = 'MATH',
  SCIENCE = 'SCIENCE',
  ENGLISH = 'ENGLISH',
  COMPUTER_SCIENCE = 'COMPUTER_SCIENCE',
  PHYSICS = 'PHYSICS',
  CHEMISTRY = 'CHEMISTRY',
  BIOLOGY = 'BIOLOGY',
  MUSIC = 'MUSIC',
  DANCE = 'DANCE',
  ART = 'ART',
  SOCIAL_STUDIES = 'SOCIAL_STUDIES',
}

export enum Class {
  NURSERY = 'NURSERY',
  LKG = 'LKG',
  UKG = 'UKG',
  FIRST = 'FIRST',
  SECOND = 'SECOND',
  THIRD = 'THIRD',
  FOURTH = 'FOURTH',
  FIFTH = 'FIFTH',
  SIXTH = 'SIXTH',
  SEVENTH = 'SEVENTH',
  EIGHTH = 'EIGHTH',
  NINTH = 'NINTH',
  TENTH = 'TENTH',
  ELEVENTH = 'ELEVENTH',
  TWELFTH = 'TWELFTH',
}

export class CreateTeacherProfileDto {
  fullName: string;
  email: string;
  gender: string;
  phone: string;
  address: string;
  dob: Date;
  subjects: Subject[];
  classes: Class[];
}