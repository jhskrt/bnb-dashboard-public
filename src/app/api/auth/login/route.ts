import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const secret = process.env.JWT_SECRET;

// Initialize Upstash Ratelimit
// Allows 10 requests from an IP address in a 15-minute window.
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '15 m'),
  analytics: true,
  prefix: '@upstash/ratelimit/bnb-dashboard',
});

export async function POST(req: NextRequest) {
  // Rate limiting logic powered by Upstash
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    let passwordIsValid = false;
    if (user.password) {
        passwordIsValid = await bcrypt.compare(password, user.password);
    }

    if (!passwordIsValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    if (!secret) {
      console.error('JWT_SECRET is not set in the environment variables.');
      return NextResponse.json({ message: 'Internal server error: JWT secret not configured.' }, { status: 500 });
    }

    const token = jwt.sign({ email: user.email }, secret, {
      expiresIn: '8h',
    });

    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}