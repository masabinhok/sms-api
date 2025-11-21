import { PrismaClient } from '../generated/prisma';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { SeedLogger } from '../../libs/utils/seed-logger.util';
import * as bcrypt from 'bcrypt';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  SeedLogger.log('🌱 Seeding auth database...');

  const existingUsers = await prisma.user.count();

  if (existingUsers === 0) {
    SeedLogger.section('👤 Creating sample users...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('Password123!', 12);

    // Sample user data - covering all roles
    const usersData = [
      // Admin users
      {
        email: 'admin@school.edu',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'admin2@school.edu',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        refreshToken: null,
      },
      // Teacher users
      {
        email: 'john.smith@school.edu',
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'sarah.johnson@school.edu',
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'michael.brown@school.edu',
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'emily.davis@school.edu',
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'david.wilson@school.edu',
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'lisa.anderson@school.edu',
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'robert.taylor@school.edu',
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'jennifer.martinez@school.edu',
        password: hashedPassword,
        role: 'TEACHER',
        isActive: true,
        refreshToken: null,
      },
      // Student users
      {
        email: 'emma.thompson@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'liam.johnson@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'olivia.garcia@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'noah.martinez@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'ava.williams@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'ethan.brown@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'sophia.davis@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'mason.rodriguez@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'isabella.wilson@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'james.anderson@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'mia.thomas@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'benjamin.lee@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'charlotte.white@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'lucas.harris@student.school.edu',
        password: hashedPassword,
        role: 'STUDENT',
        isActive: true,
        refreshToken: null,
      },
      // Guardian users
      {
        email: 'james.thompson@guardian.school.edu',
        password: hashedPassword,
        role: 'GUARDIAN',
        isActive: true,
        refreshToken: null,
      },
      {
        email: 'mary.johnson@guardian.school.edu',
        password: hashedPassword,
        role: 'GUARDIAN',
        isActive: true,
        refreshToken: null,
      },
    ];

    for (const userData of usersData) {
      await prisma.user.create({ data: userData });
    }

    SeedLogger.success(`Created ${usersData.length} sample users`);
    SeedLogger.detail('Default password for all users: Password123!');
    SeedLogger.detail('User breakdown:');
    SeedLogger.detail('  - 2 ADMIN users');
    SeedLogger.detail('  - 8 TEACHER users');
    SeedLogger.detail('  - 14 STUDENT users');
    SeedLogger.detail('  - 2 GUARDIAN users');
  } else {
    SeedLogger.success(`Users already exist (${existingUsers} found), skipping user creation`);
  }

  SeedLogger.section('✅ Auth database seeding completed successfully!');
  SeedLogger.log('');
  SeedLogger.log('📝 Next steps:');
  SeedLogger.detail('1. Login using any of the seeded emails');
  SeedLogger.detail('2. Default password: Password123!');
  SeedLogger.detail('3. Change passwords after first login for security');
  SeedLogger.detail('');
  SeedLogger.detail('Sample logins:');
  SeedLogger.detail('  Admin: admin@school.edu / Password123!');
  SeedLogger.detail('  Teacher: john.smith@school.edu / Password123!');
  SeedLogger.detail('  Student: emma.thompson@student.school.edu / Password123!');
}

main()
  .catch((e) => {
    SeedLogger.error('Error seeding auth database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
