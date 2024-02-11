// import { NestResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { Allura } from "next/font/google";
import { NextResponse } from "next/server";
import connection from '../../../utils/db'; 


const prisma = new PrismaClient();

export async function POST(request) {
  try {
    // Extract data from request body
    // const data = await request.json();
    // console.log("Received data:", data);
    // const { firstName, lastName, email, password, age, major } = data;
    const formData  = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const firstName  = formData.get('firstName');
    const lastName = formData.get('lastName');
    const age = formData.get('age');
    const major  = formData.get('major');


    // Execute SQL query to insert data into database
    const query = `
      INSERT INTO Student (firstName, lastName, email, password, age, major)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [firstName, lastName, email, password, age, major];

    await new Promise((resolve, reject) => {
      connection.query(query, values, (error, results) => {
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
    return NextResponse.json({ message: 'Data inserted successfully' });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.error({ status: 500, message: 'Internal Server Error' });
  }
}


export async function GET(request) {
  try {
    const query = `
      SELECT * FROM Student
    `;

    const users = await new Promise((resolve, reject) => {
      connection.query(query, (error, results) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          reject(error);
        } else {
          console.log("Users fetched successfully:", results);
          resolve(results);
        }
      });
    });

    // Return success response with fetched users
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.error({ status: 500, message: 'Internal Server Error' });
  }
}




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
