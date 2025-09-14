// app/api/auth/request-otp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, storeOTP, sendOTPEmail } from '../../../lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    console.log('Request to send OTP to:', email);
    
    if (!email || !email.includes('@')) {
      console.log('Invalid email provided:', email);
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }
    
    // Generate OTP
    const otp = generateOTP();
    console.log('Generated OTP:', otp);
    
    // Store OTP in database
    const stored = await storeOTP(email, otp);
    if (!stored) {
      console.error('Failed to store OTP in database');
      return NextResponse.json(
        { error: 'Failed to generate OTP' },
        { status: 500 }
      );
    }
    
    console.log('OTP stored successfully');
    
    // Send OTP via EmailJS
    const sent = await sendOTPEmail(email, otp);
    if (!sent) {
      console.error('Failed to send OTP email');
      return NextResponse.json(
        { error: 'Failed to send OTP email' },
        { status: 500 }
      );
    }
    
    console.log('OTP email sent successfully');
    
    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        // For development: Include the OTP in the response
        demoOtp: process.env.NODE_ENV === 'development' ? otp : undefined
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in request-otp endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}