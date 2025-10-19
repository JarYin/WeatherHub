export async function getSession() {
    if (typeof window === 'undefined') {
        const { cookies } = await import('next/headers');
        const cookieStore = cookies();
        const sessionCookie = (await cookieStore).get('session');
        return sessionCookie ? JSON.parse(sessionCookie.value) : null;
    } else {
        const match = document.cookie.match('(^|;)\\s*session\\s*=\\s*([^;]+)');
        if (!match) return null;
        try {
            return JSON.parse(decodeURIComponent(match[2]));
        } catch {
            return null;
        }
    }
}

export async function setSession(token: string) {
    if (typeof window === 'undefined') {
        const { cookies } = await import('next/headers');
        const cookieStore = cookies();
        (await cookieStore).set('session', token, {
            httpOnly: true,
            secure: true,
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
        });
    } else {
        document.cookie = `session=${token}; Max-Age=${60 * 60 * 24 * 7}; Path=/; Secure; SameSite=Lax`;
    }
}