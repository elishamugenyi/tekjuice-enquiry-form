//This file handles searching users displayed on the admin dashboard

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

// GET function to search users or influencers
export async function GET(request: Request) {
  const client = await db.connect();

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || ""; // Search query
    //const type = searchParams.get("type"); // "brands" or "influencers"

    /*if (!type) {
      return NextResponse.json(
        { success: false, error: "Select a Tab to seach from" },
        { status: 400 }
      );
    }*/

    let result;
    // Search users
    result = await client.sql`
    SELECT * FROM enquiry 
    WHERE name ILIKE ${`%${query}%`} 
        OR company ILIKE ${`%${query}%`} 
        OR email ILIKE ${`%${query}%`}
    ORDER BY created_at DESC;
    `;

    return NextResponse.json({ success: true, data: result.rows }, { status: 200 });
  } catch (error) {
    console.error("Error searching records:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search records" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}