//This file handles data insertion into talent table of the database.

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
        if (!body.name || !body.email1 || !body.email2 || !body.contact) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Check if the talent table exists
        //console.log("Checking if 'talent' table exists...");
        const checkTable = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'talent'
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
                CREATE TABLE talent (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    name TEXT NOT NULL,
                    email1 TEXT NOT NULL,
                    email2 TEXT UNIQUE NOT NULL,
                    contact TEXT,
                    whatsapp TEXT,
                    skills TEXT,
                    preferred_contact JSON,
                    created_at TIMESTAMP DEFAULT NOW()
                );
            `);
        }

        //Insert the user into the database
        const insertUser = await db.query(
            `INSERT INTO talent (name, email1, email2, contact, whatsapp, skills, preferred_contact)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *;`,
            [
                body.name,
                body.email1,
                body.email2,
                body.contact,
                body.whatsapp,
                body.skills,
                JSON.stringify(body.preferred_contact),
            ]
        );

        return NextResponse.json({ success: true, user: insertUser.rows[0] }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ success: false, error: "Failed to sign up. This email exists" }, { status: 500 });
    }
}
