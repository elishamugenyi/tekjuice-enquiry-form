//handes login (POST /API/ADMIN/LOGIN)
import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    // Get the request body (email and password)
    const { email, password } = await req.json();

    // Find the admin in the database
    const client = await db.connect();
    const result = await client.sql`
      SELECT * FROM admins WHERE email = ${email}
    `;
    const admin = result.rows[0];

    // If no admin is found
    if (!admin) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Compare the entered password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }

    // Create a JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }

    //include role in the jwt token payload
    const token = jwt.sign({ id: admin.id, email: admin.email, role: admin.role }, secret, { expiresIn: "1h" });

    // Return the token to the client
    return NextResponse.json({ success: true, token }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
