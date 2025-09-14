import { query } from './db';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Define interfaces for database results
interface OTPToken {
  id: number;
  email: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

interface User {
  id: number;
  email: string;
  created_at: Date;
}

interface Session {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error('Email transporter verification failed:', error);
  } else {
    console.log('Email transporter is ready to send messages');
  }
});

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via Nodemailer with Gmail SMTP
export async function sendOTPEmail(email: string, otp: string): Promise<boolean> {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Your Login OTP Code - School Manager',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>School Management App Login</h2>
          <p>Your one-time password (OTP) is:</p>
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0; background: #f3f4f6; padding: 15px; text-align: center; border-radius: 5px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280;">This is an automated message from School Manager.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully to:', email);
    return true;
  } catch (error) {
    console.error('Error sending email with Nodemailer:', error);
    return false;
  }
}

// Store OTP in database
export async function storeOTP(email: string, otp: string): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    await query(
      'INSERT INTO otp_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );
    
    return true;
  } catch (error) {
    console.error('Error storing OTP:', error);
    return false;
  }
}

// Verify OTP
export async function verifyOTP(email: string, otp: string): Promise<boolean> {
  try {
    const result = await query(
      'SELECT * FROM otp_tokens WHERE email = ? AND token = ? AND expires_at > NOW() AND used = FALSE',
      [email, otp]
    ) as OTPToken[];
    
    if (result.length === 0) {
      return false;
    }
    
    // Mark OTP as used
    await query(
      'UPDATE otp_tokens SET used = TRUE WHERE email = ? AND token = ?',
      [email, otp]
    );
    
    return true;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return false;
  }
}

// Create or get user by email
export async function getOrCreateUser(email: string): Promise<number> {
  try {
    // Check if user exists
    const users = await query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as User[];
    
    if (users.length > 0) {
      return users[0].id;
    }
    
    // Create new user
    const result = await query(
      'INSERT INTO users (email) VALUES (?)',
      [email]
    ) as { insertId: number };
    
    return result.insertId;
  } catch (error) {
    console.error('Error getting or creating user:', error);
    throw error;
  }
}

// Create session token
export function createSessionToken(userId: number): string {
  return jwt.sign(
    { userId, exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) }, // 24 hours
    process.env.NEXTAUTH_SECRET!
  );
}

// Verify session token
export function verifySessionToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { userId: number };
  } catch (error) {
    return null;
  }
}

// Store session in database
export async function storeSession(userId: number, token: string): Promise<boolean> {
  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    
    await query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
      [userId, token, expiresAt]
    );
    
    return true;
  } catch (error) {
    console.error('Error storing session:', error);
    return false;
  }
}

// Get user from session token
export async function getUserFromToken(token: string): Promise<number | null> {
  try {
    const sessions = await query(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > NOW()',
      [token]
    ) as Session[];
    
    if (sessions.length === 0) {
      return null;
    }
    
    return sessions[0].user_id;
  } catch (error) {
    console.error('Error getting user from token:', error);
    return null;
  }
}