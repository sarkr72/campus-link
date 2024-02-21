// import { NestResponse } from "next";
// import { PrismaClient } from "@prisma/client";
import { Allura } from "next/font/google";
import { NextResponse } from "next/server";
import connection from "../../../utils/db";

// const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const formData = await request.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    const major = formData.get("major");
    const phone = formData.get("phone");
    const profilePicture = formData.get("profilePicture"); // Handle file upload separately
    const bio = formData.get("bio");
    const minor = formData.get("minor");
    const isTutor = formData.get("isTutor") === "true"; // Convert to boolean
    const role = formData.get("role");
    const createdAt = new Date().toISOString(); // Format createdAt date
    const updatedAt = createdAt; // Assuming createdAt and updatedAt are the same initially
    
    // Check if the email already exists in the database
    const emailExistsQuery = `
      SELECT COUNT(*) AS count FROM Student WHERE email = ?
    `;
    const emailExistsValues = [email];
    const emailExistsResult = await new Promise((resolve, reject) => {
      connection.query(emailExistsQuery, emailExistsValues, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results[0].count);
        }
      });
    });

    if (emailExistsResult > 0) {
      // If the email already exists, return an error response
      return NextResponse.json({ message: "Email already exists" });
    }

    // If the email does not exist, insert the data into the database
    const insertQuery = `
      INSERT INTO Student (firstName, lastName, email, password, phone, role, profilePicture, bio, major, minor, isTutor, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertValues = [firstName, lastName, email, password, phone, role, profilePicture, bio, major, minor, isTutor, createdAt, updatedAt];

    await new Promise((resolve, reject) => {
      connection.query(insertQuery, insertValues, (error, results) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          reject(error);
        } else {
          console.log("Data inserted successfully:", results);
          resolve(results);
        }
      });
    });

    // Return success response
    return NextResponse.json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.error({ message: "Internal Server Error" });
  }
}




export async function GET(request) {
  try {
    const query = `
      SELECT * FROM Student
      WHERE isSignedIn = true
    `;
    console.log("i am called: ");
    const signedInUsers = await new Promise((resolve, reject) => {
      connection.query(query, (error, results) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          reject(error);
        } else {
          console.log("Signed-in users fetched successfully:", results);
          resolve(results);
        }
      });
    });

    // Return success response with fetched signed-in users
    return NextResponse.json(signedInUsers);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.error({ message: "Internal Server Error" });
  }
}


// export async function GET(request) {
//   try {
//     const query = `
//       SELECT * FROM Student
//     `;

//     const users = await new Promise((resolve, reject) => {
//       connection.query(query, (error, results) => {
//         if (error) {
//           console.error("Error executing SQL query:", error);
//           reject(error);
//         } else {
//           console.log("Users fetched successfully:", results);
//           resolve(results);
//         }
//       });
//     });

//     // Return success response with fetched users
//     return NextResponse.json(users);
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return NextResponse.error({ message: "Internal Server Error" });
//   }
// }


// export async function POST(request) {
//     try {
//         const data = await request.json();
//         console.log("data", data);
//         const { firstName, lastName, email, password, age, major } = data;
//       // Check if the email address already exists in the database
//       const existingUser = await prisma.user.findUnique({
//         where: {
//           email: email,
//         },
//       });

//       if (existingUser) {
//         // If the email address already exists, return an error response
//         return NextResponse.error({
//           status: 400,
//           message: "User with this email already exists",
//         });
//       } else {
//         // If the email address doesn't exist, create a new user
//         const newUser = await prisma.student.create({
//           data: {
//               firstName: firstName,
//               lastName: lastName,
//               email: email,
//               password: password,
//               age: age !== undefined ? age : null, // Set age to null if it's undefined in the request
//               major: major !== undefined ? major : null,
//               createdAt: new Date(),
//               updatedAt: new Date(),
//           },
//       });

//         // Return the newly created user
//         return NextResponse.json(newUser);
//       }
//     } catch (error) {
//       console.error("Error creating user:", error);
//       // Return an error response for internal server error
//       return NextResponse.error({
//         status: 500,
//         message: "Internal server error",
//       });
//     }
//   }

// get all users
// export async function GET(req, res) {
//   try {
//     const allUsers = await prisma.user.findMany();
//     return NextResponse.json(allUsers);
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     throw error;
//   }
// }
