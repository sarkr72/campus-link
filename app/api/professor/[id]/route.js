import { NextResponse } from "next/server";
import { getConnection } from "../../../../utils/db";
import { admin } from "../../../../utils/firebaseAdmin";
const db = admin.firestore();

export async function GET(request, { params }) {
  let connection;
  // const userId = await request.json();
  try {
    const email = params.id;
    const query = "SELECT * FROM Professor WHERE email = ?";
    const values = [email];
    console.log("getting user...");

    connection = await getConnection();
    const [rows] = await connection.execute(query, values);
    await connection.release();

    if (rows.length === 0) {
      return NextResponse.error({ message: "User not found", status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    if (connection) {
      await connection.release();
    }
    console.error("Error fetching user:", error);
    return NextResponse.error({ message: "Internal Server Error" });
  }
}

// Function to delete a Professor
export async function DELETE(request, { params }) {
  let connection;
  try {
    const email = params.id;
    const requestData = await request.json();
    const userId = requestData.deleteUserId;
    await admin.auth().deleteUser(userId);
    await db.collection("users").doc(userId).delete();

    if (!email) {
      console.log("Professor email not provided");
      return NextResponse.json({ error: "Professor email not provided" });
    }

    const connection = await getConnection();
    const query = `
      DELETE FROM Professor
      WHERE email = ?
    `;
    const values = [email];
    await connection.query(query, values);
    await connection.release();

    return NextResponse.json({ message: "Professor deleted successfully" });
  } catch (error) {
    if (connection) {
      await connection.release();
    }
    console.error("Error deleting Professor:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}

// Function to update a Professor
export async function PUT(request, { params }) {
  let connection;
  try {
    console.log("updating user");
    const email = params.id;
    // const formData = await request.formData();
    const formData = await request.json();
    const {
      firstName,
      lastName,
      password,
      phone,
      role,
      bio,
      major,
      minor,
      tutor,
    } = formData;
    const isTutor = tutor;
    const updatedAt = new Date().toISOString();

    connection = await getConnection();

    const query = `
      UPDATE Professor
      SET firstName = ?, lastName = ?, email = ?, password = ?, phone = ?, role = ?, 
           bio = ?, major = ?, minor = ?, isTutor = ?, updatedAt = ?
      WHERE email = ?`;

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
      updatedAt,
      email,
    ];

    // Execute the query
    await connection.query(query, values);

    await connection.release();
    console.log("Professor updated successfully");

    console.log("done update");

    return NextResponse.json({ message: "Professor updated successfully" });
  } catch (error) {
    console.error("Error updating Professor:", error);
    if (connection) {
      await connection.release();
    }
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
