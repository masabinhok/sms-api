import { PrismaClient } from '../generated/prisma';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { SeedLogger } from '../../libs/utils/seed-logger.util';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  SeedLogger.log('🌱 Seeding students database...');

  const existingStudents = await prisma.student.count();

  if (existingStudents === 0) {
    SeedLogger.section('👨‍🎓 Creating sample students...');

    // Sample student data - distributed across different classes
    const studentsData = [
      // Grade 1 students
      {
        fullName: 'Emma Thompson',
        dob: new Date('2018-05-12'),
        email: 'emma.thompson@student.school.edu',
        gender: 'Female',
        classId: 'grade-1-a', // Placeholder - will need actual class ID
        guardianName: 'James Thompson',
        guardianContact: '+1-555-1001',
        address: '100 Student Street, Education City',
        createdBy: 'system',
      },
      {
        fullName: 'Liam Johnson',
        dob: new Date('2018-08-23'),
        email: 'liam.johnson@student.school.edu',
        gender: 'Male',
        classId: 'grade-1-a',
        guardianName: 'Mary Johnson',
        guardianContact: '+1-555-1002',
        address: '101 Student Street, Education City',
        createdBy: 'system',
      },
      {
        fullName: 'Olivia Garcia',
        dob: new Date('2018-03-15'),
        email: 'olivia.garcia@student.school.edu',
        gender: 'Female',
        classId: 'grade-1-b',
        guardianName: 'Carlos Garcia',
        guardianContact: '+1-555-1003',
        address: '102 Student Street, Education City',
        createdBy: 'system',
      },
      {
        fullName: 'Noah Martinez',
        dob: new Date('2018-11-07'),
        email: 'noah.martinez@student.school.edu',
        gender: 'Male',
        classId: 'grade-1-b',
        guardianName: 'Sofia Martinez',
        guardianContact: '+1-555-1004',
        address: '103 Student Street, Education City',
        createdBy: 'system',
      },
      // Grade 5 students
      {
        fullName: 'Ava Williams',
        dob: new Date('2014-02-18'),
        email: 'ava.williams@student.school.edu',
        gender: 'Female',
        classId: 'grade-5-a',
        guardianName: 'David Williams',
        guardianContact: '+1-555-1005',
        address: '104 Student Street, Education City',
        createdBy: 'system',
      },
      {
        fullName: 'Ethan Brown',
        dob: new Date('2014-09-30'),
        email: 'ethan.brown@student.school.edu',
        gender: 'Male',
        classId: 'grade-5-a',
        guardianName: 'Lisa Brown',
        guardianContact: '+1-555-1006',
        address: '105 Student Street, Education City',
        createdBy: 'system',
      },
      // Grade 8 students
      {
        fullName: 'Sophia Davis',
        dob: new Date('2011-06-14'),
        email: 'sophia.davis@student.school.edu',
        gender: 'Female',
        classId: 'grade-8-a',
        guardianName: 'Michael Davis',
        guardianContact: '+1-555-1007',
        address: '106 Student Street, Education City',
        createdBy: 'system',
      },
      {
        fullName: 'Mason Rodriguez',
        dob: new Date('2011-12-22'),
        email: 'mason.rodriguez@student.school.edu',
        gender: 'Male',
        classId: 'grade-8-a',
        guardianName: 'Ana Rodriguez',
        guardianContact: '+1-555-1008',
        address: '107 Student Street, Education City',
        createdBy: 'system',
      },
      // Grade 10 students
      {
        fullName: 'Isabella Wilson',
        dob: new Date('2009-04-05'),
        email: 'isabella.wilson@student.school.edu',
        gender: 'Female',
        classId: 'grade-10-a',
        guardianName: 'Robert Wilson',
        guardianContact: '+1-555-1009',
        address: '108 Student Street, Education City',
        createdBy: 'system',
      },
      {
        fullName: 'James Anderson',
        dob: new Date('2009-10-11'),
        email: 'james.anderson@student.school.edu',
        gender: 'Male',
        classId: 'grade-10-a',
        guardianName: 'Patricia Anderson',
        guardianContact: '+1-555-1010',
        address: '109 Student Street, Education City',
        createdBy: 'system',
      },
      // Grade 12 Science students
      {
        fullName: 'Mia Thomas',
        dob: new Date('2007-07-19'),
        email: 'mia.thomas@student.school.edu',
        gender: 'Female',
        classId: 'grade-12-science',
        guardianName: 'Christopher Thomas',
        guardianContact: '+1-555-1011',
        address: '110 Student Street, Education City',
        createdBy: 'system',
      },
      {
        fullName: 'Benjamin Lee',
        dob: new Date('2007-01-26'),
        email: 'benjamin.lee@student.school.edu',
        gender: 'Male',
        classId: 'grade-12-science',
        guardianName: 'Sarah Lee',
        guardianContact: '+1-555-1012',
        address: '111 Student Street, Education City',
        createdBy: 'system',
      },
      // Grade 12 Commerce students
      {
        fullName: 'Charlotte White',
        dob: new Date('2007-03-08'),
        email: 'charlotte.white@student.school.edu',
        gender: 'Female',
        classId: 'grade-12-commerce',
        guardianName: 'Daniel White',
        guardianContact: '+1-555-1013',
        address: '112 Student Street, Education City',
        createdBy: 'system',
      },
      {
        fullName: 'Lucas Harris',
        dob: new Date('2007-11-15'),
        email: 'lucas.harris@student.school.edu',
        gender: 'Male',
        classId: 'grade-12-commerce',
        guardianName: 'Jennifer Harris',
        guardianContact: '+1-555-1014',
        address: '113 Student Street, Education City',
        createdBy: 'system',
      },
    ];

    for (const studentData of studentsData) {
      await prisma.student.create({ data: studentData });
    }

    SeedLogger.success(`Created ${studentsData.length} sample students`);
  } else {
    SeedLogger.success(`Students already exist (${existingStudents} found), skipping student creation`);
  }

  SeedLogger.section('✅ Students database seeding completed successfully!');
  SeedLogger.log('');
  SeedLogger.log('📝 Next steps:');
  SeedLogger.detail('1. Login to your admin dashboard');
  SeedLogger.detail('2. Go to Students section to view and manage students');
  SeedLogger.detail('3. Update class IDs to actual IDs from the academics service');
  SeedLogger.detail('4. Roll numbers are auto-generated per class');
}

main()
  .catch((e) => {
    SeedLogger.error('Error seeding students database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
