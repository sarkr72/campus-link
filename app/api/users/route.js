// import { NestResponse } from "next";
// import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
// import { getConnection } from "../../../utils/db";

// const prisma = new PrismaClient();

// import { createConnection } from "mysql2/promise";
import { admin } from "../../utils/firebaseAdmin";
const db = admin.firestore();
// import { createConnection } from "mysql2/promise";
//
// Function to establish MySQL connection
// async function getConnection() {
//   try {
//     const connection = await createConnection({
//       host: process.env.NEXT_PUBLIC_DB_HOST,
//       port: 3306,
//       user: process.env.NEXT_PUBLIC_DB_USER,
//       password: process.env.NEXT_PUBLIC_DB_PASSWORD,
//       database: process.env.NEXT_PUBLIC_DB_DATABASE,
//     });
//     return connection;
//   } catch (error) {
//     console.error("Error establishing database connection:", error);
//     throw error;
//   }
// }
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

// export async function GET(request, { params }) {
//   let connection;
//   // const userId = await request.json();
//   try {
//     const email = params.id;
//     const query = "SELECT * FROM Student WHERE email = ?";
//     const values = [email];
//     console.log("getting user...");

//     connection = await getConnection();
//     const [rows] = await connection.execute(query, values);
//     await connection.release();
//     if (rows.length === 0) {
//       return NextResponse.error({ message: "User not found", status: 404 });
//     }
//     return NextResponse.json(rows[0]);
//   } catch (error) {
//     if (connection) {
//       await connection.release();
//     }
//     console.error("Error fetching user:", error);
//     return NextResponse.error({ message: "Internal Server Error" });
//   }
// }

// Function to delete a student
export async function DELETE(request, { params }) {
  try {
    // const email = params.id;
    const requestData = await request.json();
    const userId = requestData.deleteUserId;
    await admin.auth().deleteUser(userId);
    await db.collection("users").doc(userId).delete();

    // if (!email) {
    //   console.log("Student email not provided");
    //   return NextResponse.json({ error: "Student email not provided" });
    // }
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}


// Function to establish MySQL connection
// async function getConnection() {
//   try {
//     const connection = await createConnection({
//       host: process.env.NEXT_PUBLIC_DB_HOST,
//       port: 3306,
//       user: process.env.NEXT_PUBLIC_DB_USER,
//       password: process.env.NEXT_PUBLIC_DB_PASSWORD,
//       database: process.env.NEXT_PUBLIC_DB_DATABASE,
//     });
//     return connection;
//   } catch (error) {
//     console.error("Error establishing database connection:", error);
//     throw error;
//   }
// }

// export async function POST(request) {
//   let connection;
//   try {
//     // const formData = await request.formData();
//     const formData = await request.json();
//     const {
//       firstName,
//       lastName,
//       email,
//       password,
//       phone,
//       role,
//       bio,
//       major,
//       minor,
//       tutor,
//     } = formData;
//     const isTutor = tutor;
//     const createdAt = new Date().toISOString();
//     const updatedAt = createdAt;
//     // const email = formData.get("email");
//     // const password = formData.get("password");
//     // const firstName = formData.get("firstName");
//     // const lastName = formData.get("lastName");
//     // const major = formData.get("major");
//     // const phone = formData.get("phone");
//     // const profilePicture = formData.get("profilePicture"); // Handle file upload separately
//     // const bio = formData.get("bio");
//     // const minor = formData.get("minor");
//     // const isTutor = formData.get("isTutor") === "true"; // Convert to boolean
//     // const role = formData.get("role");
//     // const createdAt = new Date().toISOString(); // Format createdAt date
//     // const updatedAt = createdAt; // Assuming createdAt and updatedAt are the same initially

//     // Check if the email already exists in the database
//     connection = await getConnection();

//     const emailExistsQuery = `
//       SELECT COUNT(*) AS count FROM Student WHERE email = ?
//     `;
//     const emailExistsValues = [email];
//     const [emailExistsResult] = await connection.query(
//       emailExistsQuery,
//       emailExistsValues
//     );

//     if (emailExistsResult[0].count > 0) {
//       return NextResponse.json({ message: "Email already exists" });
//     }
//     console.log("reached");
//     // If the email does not exist, insert the data into the database
//     const query = `
//       INSERT INTO Student (firstName, lastName, email, password, phone, role, bio, major, minor, isTutor, createdAt, updatedAt)
//       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;
//     const values = [
//       firstName,
//       lastName,
//       email,
//       password,
//       phone,
//       role,
//       bio,
//       major,
//       minor,
//       isTutor,
//       createdAt,
//       updatedAt,
//     ];

//     // Execute the query
//     await connection.query(query, values);
//     await connection.release();
//     console.log("reached2");
//     // Return success response
//     return NextResponse.json({ message: "Data inserted successfully" });
//   } catch (error) {
//     if (connection) {
//       await connection.release();
//     }
//     console.error("Error processing request:", error);
//     return NextResponse.error({ message: "Internal Server Error" });
//   }
// }

// export async function GET(request) {
//   let connection;
//   try {
//     const query = `
//       SELECT * FROM Student
//     `;
//     console.log("i am called: ");
//     connection = await getConnection();

//     const [rows] = await connection.query(query);
//     await connection.release();

//     // Return success response with fetched signed-in users
//     return NextResponse.json(rows);
//   } catch (error) {
//     if (connection) {
//       await connection.release();
//     }
//     console.error("Error processing request:", error);
//     return NextResponse.error({ message: "Internal Server Error" });
//   }
// }

//mongodb

// export async function POST(request) {
//   try {
//     const formData = await request.formData();
//     const email = formData.get("email");
//     const password = formData.get("password");
//     const firstName = formData.get("firstName");
//     const lastName = formData.get("lastName");
//     const major = formData.get("major");
//     const phone = formData.get("phone");
//     const profilePicture = formData.get("profilePicture"); // Handle file upload separately
//     const bio = formData.get("bio");
//     const minor = formData.get("minor");
//     const isTutor = formData.get("isTutor") === "true"; // Convert to boolean
//     const role = formData.get("role");
//     const createdAt = new Date().toISOString(); // Format createdAt date
//     const updatedAt = createdAt; // Assuming createdAt and updatedAt are the same initially

//     // Connect to the database
//     const db = await connection();

//     // Check if the students collection exists
//     const collectionNames = await db.listCollections().toArray();
//     const collectionExists = collectionNames.some(collection => collection.name === 'students');

//     if (!collectionExists) {
//       // If the students collection doesn't exist, create it
//       await db.createCollection('students');
//     }

//     // Get reference to the students collection
//     const collection = db.collection('students');

//     // Check if the email already exists in the database
//     const emailExistsResult = await collection.countDocuments({ email });

//     if (emailExistsResult > 0) {
//       // If the email already exists, return an error response
//       return NextResponse.json({ message: "Email already exists" }, { status: 400 });
//     }

//     // If the email does not exist, insert the data into the database
//     const result = await collection.insertOne({
//       firstName,
//       lastName,
//       email,
//       password,
//       phone,
//       role,
//       profilePicture,
//       bio,
//       major,
//       minor,
//       isTutor,
//       createdAt,
//       updatedAt
//     });

//     console.log("inserted: ", result)
//     // Return success response
//     return NextResponse.json({ message: "Data inserted successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error processing request:", error);
//     return NextResponse.error({ message: "Internal Server Error" });
//   }
// }

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
