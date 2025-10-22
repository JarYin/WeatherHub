import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('session')?.value;
  const url = req.nextUrl.clone();

  if (!token) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
