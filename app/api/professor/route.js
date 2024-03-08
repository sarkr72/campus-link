import { NextResponse } from "next/server";
import { getConnection } from "../../../utils/db";

export async function POST(request) {
  let connection;
  try {
    const formData = await request.json();
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      bio,
      major,
      minor,
      tutor,
    } = formData;
    const isTutor = tutor;
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    connection = await getConnection();

    const emailExistsQuery = `
      SELECT COUNT(*) AS count FROM Professor WHERE email = ?
    `;
    const emailExistsValues = [email];
    const [emailExistsResult] = await connection.query(
      emailExistsQuery,
      emailExistsValues
    );

    if (emailExistsResult[0].count > 0) {
      return NextResponse.json({ message: "Email already exists" });
    }
    console.log("reached");
    // If the email does not exist, insert the data into the database
    const query = `
      INSERT INTO Professor (firstName, lastName, email, password, phone, role, bio, major, minor, isTutor, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      bio,
      major,
      minor,
      isTutor,
      createdAt,
      updatedAt,
    ];

    // Execute the query
    await connection.query(query, values);
    await connection.release();
    console.log("reached2");
    // Return success response
    return NextResponse.json({ message: "Data inserted successfully" });
  } catch (error) {
    if (connection) {
      await connection.release();
    }
    console.error("Error processing request:", error);
    return NextResponse.error({ message: "Internal Server Error" });
  }
}

export async function GET(request) {
  let connection;
  try {
    const query = `
      SELECT * FROM Professor
    `;
    console.log("i am called: ");
    connection = await getConnection();

    const [rows] = await connection.query(query);
    await connection.release();

    // Return success response with fetched signed-in users
    return NextResponse.json(rows);
  } catch (error) {
    if (connection) {
      await connection.release();
    }
    console.error("Error processing request:", error);
    return NextResponse.error({ message: "Internal Server Error" });
  }
}
