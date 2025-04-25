//This file handles data insertion into talent table of the database.

import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import { validateEmail, validatePassword } from "../../lib/validator";
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Type definition for the request body
interface TalentFormData {
    name: string;
    email1: string;  // This should match the logged-in user's email
    email2: string;
    password: string;
    repeat_password: string;
    contact: string;
    whatsapp: string;
    skills: string[];
    preferred_contact: string[];
}

interface JWTPayload {
    id: string;
    email: string;
  }
  
  async function verifyToken(token: string): Promise<JWTPayload> {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
  
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
    return decoded;
  }
  

// Server-side validation function
function validateFormData(data: TalentFormData, loggedInEmail: string) {
    const errors: string[] = [];

    // Validate logged-in user's email matches email1
    /* if (data.email1 !== loggedInEmail) {
        errors.push("Primary email must match your logged-in email address");
        return errors; // Return early as this is a critical error
    } */

    // Name validation (required)
    if (!data.name || typeof data.name !== 'string' || data.name.length < 3) {
        errors.push("Name is required and must be at least 2 characters long");
    }
    if (!/^[A-Za-z\s]+$/.test(data.name)) {
        errors.push("Name should only contain letters and spaces");
    }

    // Primary email validation (required)
    const email1Validation = validateEmail(data.email1);
    if (!email1Validation.isValid) {
        errors.push(email1Validation.error || "Invalid primary email format");
    }

    // Secondary email validation (required)
    if (!data.email2 || data.email2 === "NIL") {
        errors.push("Secondary email is required");
    } else {
        const email2Validation = validateEmail(data.email2);
        if (!email2Validation.isValid) {
            errors.push(email2Validation.error || "Invalid secondary email format");
        }
        // Check if email2 is same as email1
        if (data.email2.toLowerCase() === data.email1.toLowerCase()) {
            errors.push("Secondary email must be different from primary email");
        }
    }
    //validate password
    const passwordValidation = validatePassword(data.password, data.email1);
    if (!passwordValidation.isValid) {
        errors.push(passwordValidation.error || "Invalid password format");
    } else {
        if (data.password !== data.repeat_password) {
            errors.push("Passwords do not match");
        }
    }

    // Contact validation (required)
    if (!data.contact || typeof data.contact !== 'string') {
        errors.push("Contact number is required");
    }

    // WhatsApp validation (required)
    if (!data.whatsapp || data.whatsapp == "NIL") {
        errors.push("WhatsApp number is required");
    }

    // Skills validation (required)
    if (!Array.isArray(data.skills) || data.skills.length === 0 || (data.skills.length === 1 && data.skills[0] === "NIL")) {
        errors.push("At least one skill is required");
    }

    // Preferred contact validation (at least one required)
    if (!Array.isArray(data.preferred_contact) || data.preferred_contact.length === 0) {
        errors.push("At least one preferred contact method is required");
    }
    const validContactMethods = ["Email", "Phone", "WhatsApp"];
    const invalidMethods = data.preferred_contact.filter(method => !validContactMethods.includes(method));
    if (invalidMethods.length > 0) {
        errors.push("Invalid preferred contact method(s) selected");
    }

    return errors;
}

// GET endpoint to retrieve talent details
export async function GET(req: Request) {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get('auth_token')?.value;
  
      if (!token) {
        return NextResponse.json(
          { success: false, error: "Authentication required" },
          { status: 401 }
        );
      }
  
      const decodedToken = await verifyToken(token);
  
      const result = await db.query(
        `SELECT 
          id, name, email1, email2, contact, whatsapp, 
          skills, preferred_contact, created_at
         FROM talent 
         WHERE id = $1 AND LOWER(email1) = LOWER($2)`,
        [decodedToken.id, decodedToken.email]
      );
  
      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
  
      return NextResponse.json(
        { 
          success: true, 
          data: result.rows[0] 
        },
        { status: 200 }
      );
  
    } catch (error: any) {
      console.error('Error in GET endpoint:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return NextResponse.json(
          { success: false, error: "Invalid token" },
          { status: 401 }
        );
      }
      
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { success: false, error: "Token expired" },
          { status: 401 }
        );
      }
  
      return NextResponse.json(
        { 
          success: false, 
          error: error.message || "Failed to fetch user data" 
        },
        { status: 500 }
      );
    }
  }
// PUT endpoint to update talent details
export async function PUT(req: Request) {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Authentication required" },
                { status: 401 }
            );
        }

        // Verify token and get user info
        const decodedToken = await verifyToken(token);
        const body: TalentFormData = await req.json();

        // Only validate password if it's being changed
        if (body.password) {
            const passwordValidation = validatePassword(body.password, body.email1);
            if (!passwordValidation.isValid) {
                return NextResponse.json(
                    { success: false, error: passwordValidation.error },
                    { status: 400 }
                );
            }
            if (body.password !== body.repeat_password) {
                return NextResponse.json(
                    { success: false, error: "Passwords do not match" },
                    { status: 400 }
                );
            }
        }

        // Prepare update data - don't update email1 as it's the primary key
        const updateData: any = {
            name: body.name.trim(),
            email2: body.email2.toLowerCase(),
            contact: body.contact,
            whatsapp: body.whatsapp,
            skills: body.skills,
            preferred_contact: body.preferred_contact
        };

        // Only update password if provided
        if (body.password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password_hash = await bcrypt.hash(body.password, salt);
        }

        // Update the talent details
        const updateResult = await db.query(
            `UPDATE talent 
             SET 
                name = $1,
                email2 = $2,
                contact = $3,
                whatsapp = $4,
                skills = $5,
                preferred_contact = $6
                ${body.password ? ', password_hash = $7' : ''}
             WHERE id = $${body.password ? '8' : '7'}
             RETURNING *;`,
            body.password ? [
                updateData.name,
                updateData.email2,
                updateData.contact,
                updateData.whatsapp,
                updateData.skills,
                updateData.preferred_contact,
                updateData.password_hash,
                decodedToken.id
            ] : [
                updateData.name,
                updateData.email2,
                updateData.contact,
                updateData.whatsapp,
                updateData.skills,
                updateData.preferred_contact,
                decodedToken.id
            ]
        );

        if (updateResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, error: "No details found to update" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { 
                success: true, 
                message: "Details updated successfully",
                data: updateResult.rows[0]
            },
            { status: 200 }
        );

    } catch (error: any) {
        console.error('Error updating talent details:', error);

        if (error.code === '23505') {
            return NextResponse.json(
                { success: false, error: "Email address is already in use" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { 
                success: false, 
                error: error.message || "Failed to update details" 
            },
            { status: 500 }
        );
    }
}
export async function POST(req: Request) {
    try {


        // Test database connection first
        try {
            await db.query('SELECT NOW()');
            //console.log('Database connection successful');
        } catch (error) {
            console.error('Database connection error:', error);
            return NextResponse.json(
                { success: false, error: "Database connection failed" },
                { status: 500 }
            );
        }

        // Check if the talent table exists
        
        const checkTable = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'talent'
            ) AS exists;
        `);

        // console.log('Table exists check:', checkTable.rows[0].exists);

        // Drop and recreate the table to ensure correct structure
       /* try {
             if (checkTable.rows[0].exists) {
                console.log('Dropping existing talent table');
                await db.query('DROP TABLE talent');
            } 

            console.log('Creating talent table');
            await db.query(`
                CREATE TABLE talent (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name TEXT NOT NULL,
                    email1 TEXT NOT NULL UNIQUE,
                    email2 TEXT UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    repeat_password_hash VARCHAR(255) NOT NULL,
                    contact TEXT NOT NULL,
                    whatsapp TEXT,
                    skills TEXT[],
                    preferred_contact TEXT[],
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            // console.log('Table created successfully');
        } catch (error) {
            console.error('Error creating table:', error);
            return NextResponse.json(
                { success: false, error: "Failed to set up the database table" },
                { status: 500 }
            );
        } */

        // Parse and validate request body
        const body: TalentFormData = await req.json();
        // Hash the password before storing
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(body.password, salt);
        const repeat_password_hash = await bcrypt.hash(body.repeat_password, salt);  

        // Convert arrays to PostgreSQL array format
        const skills = Array.isArray(body.skills) ? body.skills : [];
        const preferredContact = Array.isArray(body.preferred_contact) ? body.preferred_contact : [];

        // Insert the data using parameterized query
        const insertTalent = await db.query(
            `INSERT INTO talent (
                name, email1, email2, password_hash, repeat_password_hash, contact, whatsapp, skills, preferred_contact
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            ) RETURNING *;`,
            [
                body.name.trim(),
                body.email1.toLowerCase(),
                body.email2.toLowerCase(),
                password_hash,
                repeat_password_hash,
                body.contact,
                body.whatsapp,
                skills,
                preferredContact
            ]
        );

        return NextResponse.json(
            { success: true, talent: insertTalent.rows[0] },
            { status: 201 }
        );

    } catch (error: any) {
        console.error('Error in talent registration:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "One of the email addresses is already registered" 
                },
                { status: 409 }
            );
        }

        // Handle check constraint violations
        if (error.code === '23514') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid data format provided" 
                },
                { status: 400 }
            );
        }

        // Handle array parsing errors
        if (error.code === '22P02') {
            return NextResponse.json(
                { 
                    success: false, 
                    error: "Invalid format for skills or preferred contact methods" 
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { 
                success: false, 
                error: "An unexpected error occurred while saving your details. Please try again." 
            },
            { status: 500 }
        );
    }
}
