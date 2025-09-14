import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
    
    const userId = await getUserFromToken(token);
    
    if (!userId) {
      // Clear invalid token
      const response = NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
      });
      return response;
    }
    
    return NextResponse.json(
      { authenticated: true, userId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}