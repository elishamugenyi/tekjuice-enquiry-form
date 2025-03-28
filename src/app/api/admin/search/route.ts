//This file handles searching users displayed on the admin dashboard

import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

// GET function to search users or influencers
export async function GET(request: Request) {
  const client = await db.connect();

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || ""; // Search query
    const type = searchParams.get("type"); // "talent" or "enquiry"

    if (!type) {
      return NextResponse.json(
        { success: false, error: "Please Select a Table to seach from" },
        { status: 400 }
      );
    }

    if(type !== 'talent' && type !== 'enquiry') {
      return NextResponse.json(
        { success: false, error: "Invalid table type specified" },
        { status: 400 }
      );
    }

    let result;
    
    if (type === 'talent') {
      // Search talent table
      result = await client.sql`
        SELECT * FROM talent 
        WHERE name ILIKE ${`%${query}%`} 
           OR email1 ILIKE ${`%${query}%`}
           OR contact ILIKE ${`%${query}%`}
           OR skills::text ILIKE ${`%${query}%`}
        ORDER BY created_at DESC;
      `;
    } else {
      // Search enquiry table
      result = await client.sql`
        SELECT * FROM enquiry 
        WHERE name ILIKE ${`%${query}%`} 
           OR company ILIKE ${`%${query}%`} 
           OR email ILIKE ${`%${query}%`}
           OR contact ILIKE ${`%${query}%`}
           OR services::text ILIKE ${`%${query}%`}
        ORDER BY created_at DESC;
      `;
    }

    return NextResponse.json(
      { success: true, data: result.rows, searchedTable: type }, 
      { status: 200 });
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