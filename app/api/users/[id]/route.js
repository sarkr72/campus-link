import { Allura } from "next/font/google";
import { NextResponse } from "next/server";
// import createConnection from "../../../../utils/db";

import { createConnection } from "mysql2/promise";

// Function to establish MySQL connection
async function getConnection() {
  try {
    const connection = await createConnection({
      host: process.env.NEXT_PUBLIC_DB_HOST,
      port: 3306,
      user: process.env.NEXT_PUBLIC_DB_USER,
      password: process.env.NEXT_PUBLIC_DB_PASSWORD,
      database: process.env.NEXT_PUBLIC_DB_DATABASE,
    });
    return connection;
  } catch (error) {
    console.error("Error establishing database connection:", error);
    throw error;
  }
}
//mongodb

// export async function GET(req, { params }) {
//   try {
//     const email = params.id;
// console.log("daledddddd")
//     // Connect to the database
//     const db = await connection();

//     // Get reference to the students collection
//     const collection = db.collection('students');

//     // Query the database for the user with the specified email
//     const user = await collection.findOne({ email });

//     if (!user) {
//       return NextResponse.error({ message: "User not found", status: 404 });
//     }

//     console.log('dafafa', user)
//     // Return the user data
//     return NextResponse.json(user);
//   } catch (error) {
//     console.error("Error fetching user:", error);
//     return NextResponse.error({
//       message: "Internal Server Error",
//     });
//   }
// }

export async function GET(req, { params }) {
  try {
    const email = params.id;
    const query = "SELECT * FROM Student WHERE email = ?";
    const values = [email];
    console.log("Fetching user...");

    const connection = await getConnection();
    const [rows] = await connection.execute(query, values);
    await connection.end();
    if (rows.length === 0) {
      return NextResponse.error({ message: "User not found", status: 404 });
    }
    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.error({ message: "Internal Server Error" });
  }
}

// Function to delete a student
export async function DELETE(req, { params }) {
  try {
    const email = params.id;

    if (!email) {
      console.log("not found");
      return NextResponse.json({ error: "Student email not provided" });
    }

    // Execute SQL query to delete the student from the Student table
    const query = `
      DELETE FROM Student
      WHERE email = ?
    `;
    const values = [email];

    await new Promise((resolve, reject) => {
      connection.query(query, values, (error, results) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          reject(error);
        } else {
          console.log("Student deleted successfully");
          resolve();
        }
      });
    });

    // Return success response
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}

// Function to update a student
export async function PUT(request, { params }) {
  try {
    const email = params.id;
    const formData = await request.formData();
    const password = formData.get("password");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const major = formData.get("major");
    const phone = formData.get("phone");
    // Handle file upload separately
    const profilePictureFile = formData.get("profilePicture");
    const profilePicture = profilePictureFile
      ? "/uploads/" + profilePictureFile.name
      : null;
    const bio = formData.get("bio");
    const minor = formData.get("minor");
    const isTutor = formData.get("isTutor") === "true"; // Convert to boolean
    const role = formData.get("role");
    const updatedAt = new Date().toISOString(); // Format updatedAt date

    // Execute SQL query to update the student in the Student table
    const query = `
    UPDATE Student
    SET firstName = ?, lastName = ?, email = ?, password = ?, phone = ?, role = ?, 
        profilePicture = ?, bio = ?, major = ?, minor = ?, isTutor = ?, updatedAt = ?
    WHERE email = ?`;

    const values = [
      firstName,
      lastName,
      email,
      password,
      phone,
      role,
      profilePicture,
      bio,
      major,
      minor,
      isTutor,
      updatedAt,
      email,
    ];

    await new Promise((resolve, reject) => {
      connection.query(query, values, (error, results) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          reject(error);
        } else {
          console.log("Student updated successfully");
          resolve();
        }
      });
    });

    // Return success response
    return NextResponse.json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}

// export async function GET(req, { params }) {
//     try {
//       // const allUsers = await prisma.user.findMany();
//       // return NextResponse.json(allUsers);

//       const id = parseInt(params.id);
//       const users = await prisma.student.findUnique({
//         where: {
//           id: id,
//         },
//       });
//       return NextResponse.json(users)
//     } catch (error) {
//       console.error("Error fetching users:", error);
//       throw error;
//     }
//   }
