import { NextRequest, NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      // Delete session from database
      await query(
        'DELETE FROM sessions WHERE token = ?',
        [token]
      );
    }
    
    // Clear cookie
    const response = NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
    });
    
    return response;
  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}