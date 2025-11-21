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
    SeedLogger.section('👤 Creating admin user...');

    // Hash password for admin user
    const hashedPassword = await bcrypt.hash('Admin!123', 12);

    const adminUser = {
      username: 'admin-demo',
      passwordHash: hashedPassword,
      role: 'ADMIN' as const,
      profileId: 'admin-profile-id',
      profileEmail: 'admin-demo@school.edu',
      schoolId: null,
      passwordChangeCount: 0,
      refreshToken: null,
    };

    await prisma.user.create({ data: adminUser });

    SeedLogger.success(`Created 1 admin user`);
    SeedLogger.detail('Username: admin-demo');
    SeedLogger.detail('Password: Admin!123');
  } else {
    SeedLogger.success(`Users already exist (${existingUsers} found), skipping user creation`);
  }

  SeedLogger.section('✅ Auth database seeding completed successfully!');
  SeedLogger.log('');
  SeedLogger.log('📝 Login credentials:');
  SeedLogger.detail('  Username: admin-demo');
  SeedLogger.detail('  Password: Admin!123');
}

main()
  .catch((e) => {
    SeedLogger.error('Error seeding auth database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
