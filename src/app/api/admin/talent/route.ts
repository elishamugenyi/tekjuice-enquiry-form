//This file handles data retrieval from talet table to display to admin dashboard

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { parse } from "path";

// GET function to retrieve enquiry
export async function GET(request: Request) {
  const client = await db.connect()

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10); //Default to page 1
    const limit = parseInt(searchParams.get('limit') || '10', 10); //Default to 10 records per page
    const offset = (page - 1) * limit;

    const enquiryResult = await client.sql`
      SELECT * FROM talent 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};
      `;
    //fetch total count of enquiries
    const totalResult = await client.sql`
      SELECT COUNT(*) as total FROM talent;
      `;
    const total = totalResult.rows[0].total;

    return NextResponse.json({ success: true, enquiry: enquiryResult.rows, total, page, limit, }, { status: 200 });
  } catch (error) {
    console.error("Error fetching talent:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch talent details" }, { status: 500 });
  } finally {
    client.release();
  }
}

//delete function that deletes a user/enquiry.
export async function DELETE(request: Request) {
  const client = await db.connect();

    try {
        const { email1 } = await request.json();

        if (!email1) {
            return NextResponse.json({ success: false, error: "User Email is required" }, { status: 400 });
        }

        // Log the id to verify it's correct
        //console.log("Deleting user with Email:", email);

        await client.sql `DELETE FROM enquiry WHERE email = ${email1};`;

        return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
    }
}

// PUT function to update an enquiry
export async function PUT(req: Request) {
  try {
    const { name, email1, contact } = await req.json();
    if (!name || !email1 || !contact) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }
    const updatedInfluencer = await db.query(
      "UPDATE enquiry SET name = $1, email1 = $2, email1 = $3 WHERE email1 = $3 RETURNING *;",
      [name, email1, contact]
    );
    return NextResponse.json({ success: true, influencer: updatedInfluencer.rows[0], message: "User Updated Successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}