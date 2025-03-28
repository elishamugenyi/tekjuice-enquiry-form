//This file handles data retrieval from db to display to admin dashboard

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
      SELECT * FROM enquiry 
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset};
      `;
    //fetch total count of enquiries
    const totalResult = await client.sql`
      SELECT COUNT(*) as total FROM enquiry;
      `;
    const total = totalResult.rows[0].total;

    return NextResponse.json({ 
      success: true, 
      data: enquiryResult.rows, 
      total, 
      page, 
      limit, 
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch enquiries" }, { status: 500 });
  } finally {
    client.release();
  }
}

//delete function that deletes a user/enquiry.
export async function DELETE(request: Request) {
  const client = await db.connect();

    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ success: false, error: "User Email is required" }, { status: 400 });
        }

        // Log the id to verify it's correct
        //console.log("Deleting user with Email:", email);

        await client.sql `DELETE FROM enquiry WHERE email = ${email};`;

        return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
    }
}

// PUT function to update an enquiry
export async function PUT(req: Request) {
  try {
    const { name, company, email } = await req.json();
    if (!name || !company || !email) {
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });
    }
    const updatedEnquiry = await db.query(
      "UPDATE enquiry SET name = $1, company = $2, email = $3 WHERE email = $3 RETURNING *;",
      [name, company, email]
    );
    return NextResponse.json({ success: true, enquiry: updatedEnquiry.rows[0], message: "User Updated Successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating influencer:", error);
    return NextResponse.json({ success: false, error: "Failed to update influencer" }, { status: 500 });
  }
}