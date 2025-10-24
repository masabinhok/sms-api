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

  if (!existingSchool) {
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
  } else {
    console.log('✅ School already exists, skipping school creation');
  }

  // Seed Classes
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  const existingClasses = await prisma.class.count();
  
  if (existingClasses === 0) {
    console.log('\n� Creating sample classes...');
    
    const classesData = [
      // Pre-primary
      { name: 'Nursery', slug: 'nursery', grade: 0, section: null, capacity: 25, academicYear, description: 'Pre-primary nursery class' },
      { name: 'LKG', slug: 'lkg', grade: 0, section: null, capacity: 25, academicYear, description: 'Lower Kindergarten' },
      { name: 'UKG', slug: 'ukg', grade: 0, section: null, capacity: 25, academicYear, description: 'Upper Kindergarten' },
      
      // Primary (Grades 1-5)
      { name: 'Grade 1', slug: 'grade-1-a', grade: 1, section: 'A', capacity: 40, academicYear, description: 'Grade 1 Section A' },
      { name: 'Grade 1', slug: 'grade-1-b', grade: 1, section: 'B', capacity: 40, academicYear, description: 'Grade 1 Section B' },
      { name: 'Grade 2', slug: 'grade-2-a', grade: 2, section: 'A', capacity: 40, academicYear, description: 'Grade 2 Section A' },
      { name: 'Grade 3', slug: 'grade-3-a', grade: 3, section: 'A', capacity: 40, academicYear, description: 'Grade 3 Section A' },
      { name: 'Grade 4', slug: 'grade-4-a', grade: 4, section: 'A', capacity: 40, academicYear, description: 'Grade 4 Section A' },
      { name: 'Grade 5', slug: 'grade-5-a', grade: 5, section: 'A', capacity: 40, academicYear, description: 'Grade 5 Section A' },
      
      // Secondary (Grades 6-10)
      { name: 'Grade 6', slug: 'grade-6-a', grade: 6, section: 'A', capacity: 45, academicYear, description: 'Grade 6 Section A' },
      { name: 'Grade 7', slug: 'grade-7-a', grade: 7, section: 'A', capacity: 45, academicYear, description: 'Grade 7 Section A' },
      { name: 'Grade 8', slug: 'grade-8-a', grade: 8, section: 'A', capacity: 45, academicYear, description: 'Grade 8 Section A' },
      { name: 'Grade 9', slug: 'grade-9-a', grade: 9, section: 'A', capacity: 45, academicYear, description: 'Grade 9 Section A' },
      { name: 'Grade 10', slug: 'grade-10-a', grade: 10, section: 'A', capacity: 45, academicYear, description: 'Grade 10 Section A' },
      
      // Higher Secondary (Grades 11-12)
      { name: 'Grade 11 Science', slug: 'grade-11-science', grade: 11, section: 'Science', capacity: 40, academicYear, description: 'Grade 11 Science Stream' },
      { name: 'Grade 11 Commerce', slug: 'grade-11-commerce', grade: 11, section: 'Commerce', capacity: 40, academicYear, description: 'Grade 11 Commerce Stream' },
      { name: 'Grade 12 Science', slug: 'grade-12-science', grade: 12, section: 'Science', capacity: 40, academicYear, description: 'Grade 12 Science Stream' },
      { name: 'Grade 12 Commerce', slug: 'grade-12-commerce', grade: 12, section: 'Commerce', capacity: 40, academicYear, description: 'Grade 12 Commerce Stream' },
    ];

    for (const classData of classesData) {
      await prisma.class.create({ data: classData });
    }

    console.log(`✅ Created ${classesData.length} sample classes`);
  } else {
    console.log(`✅ Classes already exist (${existingClasses} found), skipping class creation`);
  }

  // Seed Subjects
  const existingSubjects = await prisma.subject.count();
  
  if (existingSubjects === 0) {
    console.log('\n📖 Creating sample subjects...');
    
    const subjectsData = [
      // Core subjects
      { name: 'Mathematics', slug: 'mathematics', code: 'MATH101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: false, creditHours: 5 },
      { name: 'English', slug: 'english', code: 'ENG101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: false, creditHours: 5 },
      { name: 'Science', slug: 'science', code: 'SCI101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: true, theoryMarks: 70, practicalMarks: 30, creditHours: 5 },
      { name: 'Social Studies', slug: 'social-studies', code: 'SOC101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: false, creditHours: 4 },
      { name: 'Nepali', slug: 'nepali', code: 'NEP101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: false, creditHours: 5 },
      
      // Science stream subjects
      { name: 'Physics', slug: 'physics', code: 'PHY101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: true, theoryMarks: 75, practicalMarks: 25, creditHours: 5 },
      { name: 'Chemistry', slug: 'chemistry', code: 'CHEM101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: true, theoryMarks: 75, practicalMarks: 25, creditHours: 5 },
      { name: 'Biology', slug: 'biology', code: 'BIO101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: true, theoryMarks: 75, practicalMarks: 25, creditHours: 5 },
      
      // Commerce stream subjects
      { name: 'Accountancy', slug: 'accountancy', code: 'ACC101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: false, creditHours: 5 },
      { name: 'Business Studies', slug: 'business-studies', code: 'BUS101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: false, creditHours: 5 },
      { name: 'Economics', slug: 'economics', code: 'ECO101', category: 'Core', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: false, creditHours: 5 },
      
      // Elective subjects
      { name: 'Computer Science', slug: 'computer-science', code: 'CS101', category: 'Elective', fullMarks: 100, passMarks: 40, hasTheory: true, hasPractical: true, theoryMarks: 60, practicalMarks: 40, creditHours: 4 },
      { name: 'Art & Craft', slug: 'art-craft', code: 'ART101', category: 'Elective', fullMarks: 50, passMarks: 20, hasTheory: false, hasPractical: true, creditHours: 2 },
      { name: 'Physical Education', slug: 'physical-education', code: 'PE101', category: 'Elective', fullMarks: 50, passMarks: 20, hasTheory: false, hasPractical: true, creditHours: 2 },
      { name: 'Music', slug: 'music', code: 'MUS101', category: 'Extra-curricular', fullMarks: 50, passMarks: 20, hasTheory: false, hasPractical: true, creditHours: 2 },
    ];

    for (const subjectData of subjectsData) {
      await prisma.subject.create({ data: subjectData });
    }

    console.log(`✅ Created ${subjectsData.length} sample subjects`);
  } else {
    console.log(`✅ Subjects already exist (${existingSubjects} found), skipping subject creation`);
  }

  console.log('\n✅ Database seeding completed successfully!');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Login to your admin dashboard');
  console.log('   2. Go to Settings > School Information to update school details');
  console.log('   3. Go to Academics > Classes to manage classes');
  console.log('   4. Go to Academics > Subjects to manage subjects');
  console.log('   5. Assign subjects to classes as needed');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
