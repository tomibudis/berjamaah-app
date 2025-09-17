import 'dotenv/config';
import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
// import { auth } from '../src/lib/auth'; // Temporarily disabled

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: {
      OR: [{ email: 'admin@berjamaah.com' }, { role: 'admin' }],
    },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', existingAdmin.email);
  } else {
    // Create admin user directly with Prisma
    try {
      const hashedPassword = await hash('admin123!', 12);

      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@berjamaah.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'admin',
        },
      });

      console.log('✅ Admin user created successfully:');
      console.log('   📧 Email: admin@berjamaah.com');
      console.log('   🔑 Password: admin123!');
      console.log('   👑 Role: admin');
      console.log('   🆔 ID:', adminUser.id);
    } catch (error) {
      console.error('❌ Error creating admin user:', error);
    }
  }

  // Create a sample regular user for testing
  const existingUser = await prisma.user.findFirst({
    where: { email: 'user@berjamaah.com' },
  });

  if (!existingUser) {
    try {
      const hashedPassword = await hash('user123!', 12);

      const regularUser = await prisma.user.create({
        data: {
          email: 'user@berjamaah.com',
          password: hashedPassword,
          name: 'Regular User',
          role: 'user',
        },
      });

      console.log('✅ Sample user created successfully:');
      console.log('   📧 Email: user@berjamaah.com');
      console.log('   🔑 Password: user123!');
      console.log('   👤 Role: user');
      console.log('   🆔 ID:', regularUser.id);
    } catch (error) {
      console.error('❌ Error creating sample user:', error);
    }
  } else {
    console.log('✅ Sample user already exists:', existingUser.email);
  }

  console.log('🎉 Database seeding completed!');
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
