import { NextResponse } from "next/server";
import { getConnection } from "../../../utils/db";

export async function POST(request) {
  let connection;
  try {
    const formData = await request.json();
    const { title, comment, role, email, imagesCount, imageUrls } = formData;

    const createdAt = new Date().toISOString();

    connection = await getConnection();

    let userId;
    if (role.toLowerCase() === "student") {
      const studentQuery = `
        SELECT id FROM Student WHERE email = ?
      `;
      const [studentResults] = await connection.query(studentQuery, email);
      if (studentResults.length === 0) {
        return NextResponse.json({ message: "Student not found" });
      }
      userId = studentResults[0].id;
    } else if (role === "Professor") {
    } else if (role === "Admin") {
    } else {
      return NextResponse.json({ message: "Invalid role" });
    }

    const query = ` INSERT INTO Post (userId, content, imagesCount, createdAt)
  VALUES (?, ?, ?, ?)
`;
    const values = [userId, comment, imagesCount, createdAt];
    await connection.query(query, values);
    const [result] = await connection.query(
      "SELECT LAST_INSERT_ID() as postId"
    );
    const postId = result[0].postId;

    for (const imageUrl of imageUrls) {
      const queryPostImage = `
        INSERT INTO PostImage (postId, imageUrl, createdAt)
        VALUES (?, ?, ?)
      `;
      const valuesPostImage = [postId, imageUrl, createdAt];
      await connection.query(queryPostImage, valuesPostImage);
    }

    await connection.release();
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
    const formData = await request.json();
    const { email } = formData;
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
