import { NextResponse } from "next/server";
import { getConnection } from "../../../../utils/db";
import { admin } from "../../../../utils/firebaseAdmin";
const db = admin.firestore();

export async function GET(request, { params }) {
  let connection;
  // const userId = await request.json();
  try {
    const email = params.id;
    const query = "SELECT * FROM Admin WHERE email = ?";
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

// Function to delete a Admin
export async function DELETE(request, { params }) {
  let connection;
  try {
    const email = params.id;
    const requestData = await request.json();
    const userId = requestData.deleteUserId;
    await admin.auth().deleteUser(userId);
    await db.collection("users").doc(userId).delete();

    if (!email) {
      console.log("Admin email not provided");
      return NextResponse.json({ error: "Admin email not provided" });
    }

    const connection = await getConnection();
    const query = `
      DELETE FROM Admin
      WHERE email = ?
    `;
    const values = [email];
    await connection.query(query, values);
    await connection.release();

    return NextResponse.json({ message: "Admin deleted successfully" });
  } catch (error) {
    if (connection) {
      await connection.release();
    }
    console.error("Error deleting Admin:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}

// Function to update a Admin
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
      UPDATE Admin
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
    console.log("Admin updated successfully");

    console.log("done update");

    return NextResponse.json({ message: "Admin updated successfully" });
  } catch (error) {
    console.error("Error updating Admin:", error);
    if (connection) {
      await connection.release();
    }
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
