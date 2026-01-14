import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const secret = process.env.JWT_SECRET;

// In-memory store for rate limiting
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_COUNT = 10;
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
  // Rate limiting logic
  const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (record && now - record.timestamp < RATE_LIMIT_WINDOW) {
    if (record.count >= RATE_LIMIT_COUNT) {
      return NextResponse.json(
        { message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    rateLimitStore.set(ip, { ...record, count: record.count + 1 });
  } else {
    // Start a new record
    rateLimitStore.set(ip, { count: 1, timestamp: now });
  }

  // Cleanup old records periodically (optional, for memory management)
  if (Math.random() < 0.1) { // 10% chance to run cleanup
    for (const [key, value] of rateLimitStore.entries()) {
      if (now - value.timestamp > RATE_LIMIT_WINDOW) {
        rateLimitStore.delete(key);
      }
    }
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
    
    // Reset rate limit on successful login
    rateLimitStore.delete(ip);

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