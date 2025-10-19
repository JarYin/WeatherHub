import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // ✅ skip middleware สำหรับหน้า public
    if (pathname === '/') {
        return NextResponse.next();
    }

    const token = request.cookies.get('session')?.value;
    console.log('Middleware token:', token);

    // ✅ ไม่มี token → redirect ไป signin
    if (!token) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = '/';
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();

}

export const config = {
    matcher: ['/dashboard/:path*'],
};