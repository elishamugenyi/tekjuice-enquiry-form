//This file handles data insertion into enquiry table of the database.

import { NextResponse } from "next/server";
import { db } from "../../lib/db";

export async function POST(req: Request) {
    //console.log("Testing database connection...");

    //test database connection
    try {
        const testQuery = await db.query(`SELECT 1 + 1 AS result;`);
        //console.log("Database connection successful:", testQuery.rows[0].result);
    } catch (error) {
        //console.error("Database connection failed:", error);
        return NextResponse.json({ success: false, error: "Database connection failed" }, { status: 500 });
    }

    try {
        const body = await req.json();
        //console.log("Recieved data:", body); //debugging log

        // Validate input before inserting
        if (!body.name || !body.email || !body.contact) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Check if the enquiry table exists
        //console.log("Checking if 'enquiry' table exists...");
        const checkTable = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'enquiry'
            ) AS exists;
        `);
        //console.log("Table exists query completed.");

        const tableExists = checkTable.rows[0].exists;

        //drop table
        /*if(tableExists) {
            console.log("Dropping existing 'users' table....");
            await db.query('Drop Table users');
            console.log("Table dropped successfully.")
        }*/

        // If the table does not exist, create it
        if (!tableExists) {
            await db.query(`
                CREATE TABLE enquiry (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name TEXT NOT NULL,
                    company TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    contact TEXT,
                    location TEXT,
                    services JSON,
                    about_you TEXT,
                    preferred_contact JSON,
                    know_us JSON,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `);
        }

        //Insert the user into the database
        const insertUser = await db.query(
            `INSERT INTO enquiry (name, company, email, contact, location, services, about_you, preferred_contact, know_us)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
             RETURNING *;`,
            [
                body.name,
                body.company,
                body.email,
                body.contact,
                body.location,
                JSON.stringify(body.services), // Convert JSON to string
                body.about_you,
                JSON.stringify(body.preferred_contact),
                JSON.stringify(body.know_us),
            ]
        );

        return NextResponse.json({ success: true, user: insertUser.rows[0] }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Failed to sign up. This email exists" }, { status: 500 });
    }
}
