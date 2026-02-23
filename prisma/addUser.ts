
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error('Usage: npx ts-node prisma/addUser.ts <email> <password>');
    process.exit(1);
  }

  const [email, plainPassword] = args;

  if (!email || !plainPassword) {
    console.error('Email and password cannot be empty.');
    process.exit(1);
  }

  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });

    console.log(`Successfully created user: ${newUser.email}`);
  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error(`Error: Email '${email}' already exists.`);
    } else {
      console.error('Failed to create user:', error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
