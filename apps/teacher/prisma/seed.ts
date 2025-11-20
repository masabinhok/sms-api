import { PrismaClient } from '../generated/prisma';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { SeedLogger } from '../../libs/utils/seed-logger.util';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  SeedLogger.log('🌱 Seeding teachers database...');

  const existingTeachers = await prisma.teacher.count();

  if (existingTeachers === 0) {
    SeedLogger.section('👨‍🏫 Creating sample teachers...');

    // Sample teacher data
    const teachersData = [
      {
        fullName: 'John Smith',
        dob: new Date('1985-03-15'),
        gender: 'Male',
        email: 'john.smith@school.edu',
        phone: '+1-555-0101',
        address: '123 Teacher Lane, Education City',
        subjectIds: [], // Will be populated based on actual subject IDs
        classIds: [], // Will be populated based on actual class IDs
        createdBy: 'system',
      },
      {
        fullName: 'Sarah Johnson',
        dob: new Date('1988-07-22'),
        gender: 'Female',
        email: 'sarah.johnson@school.edu',
        phone: '+1-555-0102',
        address: '456 Scholar Street, Education City',
        subjectIds: [],
        classIds: [],
        createdBy: 'system',
      },
      {
        fullName: 'Michael Brown',
        dob: new Date('1982-11-08'),
        gender: 'Male',
        email: 'michael.brown@school.edu',
        phone: '+1-555-0103',
        address: '789 Academic Avenue, Education City',
        subjectIds: [],
        classIds: [],
        createdBy: 'system',
      },
      {
        fullName: 'Emily Davis',
        dob: new Date('1990-04-18'),
        gender: 'Female',
        email: 'emily.davis@school.edu',
        phone: '+1-555-0104',
        address: '321 Learning Road, Education City',
        subjectIds: [],
        classIds: [],
        createdBy: 'system',
      },
      {
        fullName: 'David Wilson',
        dob: new Date('1986-09-25'),
        gender: 'Male',
        email: 'david.wilson@school.edu',
        phone: '+1-555-0105',
        address: '654 Knowledge Blvd, Education City',
        subjectIds: [],
        classIds: [],
        createdBy: 'system',
      },
      {
        fullName: 'Lisa Anderson',
        dob: new Date('1989-12-30'),
        gender: 'Female',
        email: 'lisa.anderson@school.edu',
        phone: '+1-555-0106',
        address: '987 Wisdom Way, Education City',
        subjectIds: [],
        classIds: [],
        createdBy: 'system',
      },
      {
        fullName: 'Robert Taylor',
        dob: new Date('1984-06-12'),
        gender: 'Male',
        email: 'robert.taylor@school.edu',
        phone: '+1-555-0107',
        address: '147 Teaching Trail, Education City',
        subjectIds: [],
        classIds: [],
        createdBy: 'system',
      },
      {
        fullName: 'Jennifer Martinez',
        dob: new Date('1991-02-28'),
        gender: 'Female',
        email: 'jennifer.martinez@school.edu',
        phone: '+1-555-0108',
        address: '258 Education Plaza, Education City',
        subjectIds: [],
        classIds: [],
        createdBy: 'system',
      },
    ];

    for (const teacherData of teachersData) {
      await prisma.teacher.create({ data: teacherData });
    }

    SeedLogger.success(`Created ${teachersData.length} sample teachers`);
  } else {
    SeedLogger.success(`Teachers already exist (${existingTeachers} found), skipping teacher creation`);
  }

  SeedLogger.section('✅ Teachers database seeding completed successfully!');
  SeedLogger.log('');
  SeedLogger.log('📝 Next steps:');
  SeedLogger.detail('1. Login to your admin dashboard');
  SeedLogger.detail('2. Go to Teachers section to view and manage teachers');
  SeedLogger.detail('3. Assign subjects and classes to teachers as needed');
}

main()
  .catch((e) => {
    SeedLogger.error('Error seeding teachers database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
