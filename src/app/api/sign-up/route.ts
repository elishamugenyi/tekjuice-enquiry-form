//this file handles data insertion into the sign-up table of the database.

import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import bcrypt from 'bcryptjs';
import { validateEmail, validatePassword } from "../../lib/validator";

export async function POST(req: Request) {
    try {
        const testQuery = await db.query(`SELECT 1 + 1 AS result;`);
    } catch (error) {
        return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    try {
        const body = await req.json();
        //console.log("Received data:", body);

        // Validate email format
        const emailValidation = validateEmail(body.email);
        if (!emailValidation.isValid) {
            return NextResponse.json({ 
                success: false, 
                error: emailValidation.error 
            }, { status: 400 });
        }

        // Validate password
        const passwordValidation = validatePassword(body.password, body.email);
        if (!passwordValidation.isValid) {
            return NextResponse.json({ 
                success: false, 
                error: passwordValidation.error 
            }, { status: 400 });
        }

        // Validate other required fields
        if (!body.userType) {
            return NextResponse.json({ 
                success: false, 
                error: "User type is required" 
            }, { status: 400 });
        }

        // Validate userType value
        if (!['company', 'talent'].includes(body.userType)) {
            return NextResponse.json({ 
                success: false, 
                error: "Invalid user type selected" 
            }, { status: 400 });
        }

        // Check if the users table exists
        const checkTable = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'users'
            ) AS exists;
        `);

        const tableExists = checkTable.rows[0].exists;

        // If the table does not exist, create it
        if (!tableExists) {
            await db.query(`
                CREATE TABLE users (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('company', 'talent')),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
        }

        // Hash the password before storing
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(body.password, salt);

        //Insert the user into the database
        const insertUser = await db.query(
            `INSERT INTO users (email, password_hash, user_type)
             VALUES ($1, $2, $3)
             RETURNING id, email, user_type, created_at;`,
            [
                body.email,
                passwordHash,
                body.userType
            ]
        );

        return NextResponse.json({ 
            success: true, 
            user: {
                id: insertUser.rows[0].id,
                email: insertUser.rows[0].email,
                userType: insertUser.rows[0].user_type,
                createdAt: insertUser.rows[0].created_at
            }
        }, { status: 201 });
    } catch (error: any) {
        console.error(error);
        if (error.code === '23505') { // Unique violation error code
            return NextResponse.json({ 
                success: false, 
                error: "Email already exists. Please use a different email or try logging in." 
            }, { status: 409 });
        }
        return NextResponse.json({ 
            success: false, 
            error: "Failed to create account. Please try again later." 
        }, { status: 500 });
    }
}
