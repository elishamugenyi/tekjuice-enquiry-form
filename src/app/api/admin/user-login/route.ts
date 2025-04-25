//handes login (POST /API/ADMIN/USER-LOGIN/)
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { validateEmail } from "../../../lib/validator";
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Rate limiting configuration
const MAX_LOGIN_ATTEMPTS = 4;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

// Store failed attempts in memory (in production, use Redis or similar)
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check for rate limiting
    const now = Date.now();
    const attempts = failedAttempts.get(email);
    
    if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
      const timeSinceLastAttempt = now - attempts.lastAttempt;
      if (timeSinceLastAttempt < LOCKOUT_DURATION) {
        const remainingTime = Math.ceil((LOCKOUT_DURATION - timeSinceLastAttempt) / 60000);
        return NextResponse.json(
          { 
            success: false, 
            error: `Too many failed attempts. Please try again in ${remainingTime} minutes.` 
          },
          { status: 429 }
        );
      } else {
        // Reset attempts after lockout duration
        failedAttempts.delete(email);
      }
    }

    // Use parameterized query to prevent SQL injection
    const userQuery = await db.query(
      `SELECT id, email1, password_hash
       FROM talent 
       WHERE LOWER(email1) = LOWER($1)`,
      [email]
    );

    if (userQuery.rows.length === 0) {
      // Increment failed attempts
      const currentAttempts = failedAttempts.get(email) || { count: 0, lastAttempt: 0 };
      failedAttempts.set(email, {
        count: currentAttempts.count + 1,
        lastAttempt: now
      });

      // Use generic error message to prevent user enumeration
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = userQuery.rows[0];

    // Verify password with constant-time comparison
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      // Increment failed attempts
      const currentAttempts = failedAttempts.get(email) || { count: 0, lastAttempt: 0 };
      failedAttempts.set(email, {
        count: currentAttempts.count + 1,
        lastAttempt: now
      });

      // Use generic error message to prevent user enumeration
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    failedAttempts.delete(email);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email1, 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    //afte successful authenitcation and login, redirect to the update-talent page and autofill the details
    const userDetails = await db.query(
      `SELECT * FROM talent WHERE id = $1`,
      [user.id]
    );
    // Create the response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email1,
        existingData: {
          name: user.name,
          email1: user.email1,
          email2: user.email2,
          contact: user.contact,
          whatsapp: user.whatsapp,
          skills: user.skills || [],
          preferred_contact: user.preferred_contact || []
        }
      },
      redirectTo: '/update-talent'
    }, { status: 200 });

    // Set the JWT token in an HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
      path: '/'
    });

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Content-Security-Policy', "default-src 'self'");

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
