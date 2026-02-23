
import { NextRequest, NextResponse } from 'next/server';
import * as jose from 'jose';

const secretString = process.env.JWT_SECRET;
if (!secretString) {
  throw new Error('JWT_SECRET is not set in the environment variables.');
}
const secret = new TextEncoder().encode(secretString);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip authentication for auth routes (login, logout)
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const sessionCookie = req.cookies.get('session');

  if (!sessionCookie) {
    if (pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  try {
    // Using jose for JWT verification as it's recommended for Edge environments (like Middleware)
    await jose.jwtVerify(sessionCookie.value, secret);
    return NextResponse.next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    if (req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
