import { PrismaClient } from '../generated/prisma';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if school already exists
  const existingSchool = await prisma.school.findFirst();

  if (existingSchool) {
    console.log('✅ School already exists, skipping seed');
    return;
  }

  // Create default school
  const school = await prisma.school.create({
    data: {
      name: 'Your School Name',
      tagline: 'Excellence in Education',
      motto: 'Empowering Minds, Shaping Futures',
      
      // Contact Information
      address: '123 Education Street',
      city: 'Your City',
      phone: '+1 (555) 123-4567',
      email: 'info@yourschool.edu',
      
      // Social Media (optional - empty strings as placeholders)
      facebook: 'https://facebook.com/yourschool',
      instagram: 'https://instagram.com/yourschool',
      twitter: 'https://twitter.com/yourschool',
      youtube: 'https://youtube.com/@yourschool',
      
      // About Information
      description: 'Welcome to our school! We provide quality education in a nurturing environment. Replace this description with your school\'s actual information through the School Info settings page.',
      mission: 'To provide quality education that empowers students to become responsible global citizens. Update this mission statement through the settings.',
      vision: 'To be a leading educational institution recognized for academic excellence and holistic development. Update this vision through the settings.',
      
      // Hero Section
      heroTitle: 'Welcome to Your School',
      heroSubtitle: 'Nurturing excellence in education. Update this welcome message through the School Info settings.',
      heroCTA: 'Learn More',
    },
  });

  console.log('✅ Default school created successfully!');
  console.log(`   School ID: ${school.id}`);
  console.log(`   School Name: ${school.name}`);
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Login to your admin dashboard');
  console.log('   2. Go to Settings > School Information');
  console.log('   3. Update the school details with your actual information');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
