import 'dotenv/config';
import { PrismaClient } from './generated/client';
import { auth } from '../src/lib/auth';

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
    // Create admin user using Better Auth
    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: 'admin@berjamaah.com',
          password: 'admin123!',
          name: 'Admin User',
        },
      });

      if (result.user) {
        // Update the user role to admin
        await prisma.user.update({
          where: { id: result.user.id },
          data: { role: 'admin' },
        });

        console.log('✅ Admin user created successfully:');
        console.log('   📧 Email: admin@berjamaah.com');
        console.log('   🔑 Password: admin123!');
        console.log('   👑 Role: admin');
        console.log('   🆔 ID:', result.user.id);
      }
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
      const result = await auth.api.signUpEmail({
        body: {
          email: 'user@berjamaah.com',
          password: 'user123!',
          name: 'Regular User',
        },
      });

      if (result.user) {
        console.log('✅ Sample user created successfully:');
        console.log('   📧 Email: user@berjamaah.com');
        console.log('   🔑 Password: user123');
        console.log('   👤 Role: user');
        console.log('   🆔 ID:', result.user.id);
      }
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
