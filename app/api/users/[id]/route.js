import { PrismaClient } from "@prisma/client";
import { Allura } from "next/font/google";
import { NextResponse } from "next/server";
import connection from '../../../../utils/db'; 

const prisma = new PrismaClient();




export async function GET(req, { params }) {
  try {
    // Extract user ID from request parameters
    const id = parseInt(params.id);

    // Execute SQL query to fetch user by ID from Student table
    const query = `
      SELECT * FROM Student
      WHERE id = ?
    `;
    const values = [id];

    const user = await new Promise((resolve, reject) => {
      connection.query(query, values, (error, results) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          reject(error);
        } else {
          console.log("User fetched successfully:", results[0]);
          resolve(results[0]); // Assuming there is only one user with the given ID
        }
      });
    });

    // Check if user was found
    if (!user) {
      return NextResponse.error({ status: 404, message: 'User not found' });
    }

    // Return success response with fetched user
    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.error({ status: 500, message: 'Internal Server Error' });
  }
}

// Function to delete a student
export async function DELETE(req, { params }) {
  try {
    const id = parseInt(params.id);

    if (!id) {
      // If the student ID is missing, return an error response
      return NextResponse.json({ error: 'Student ID not provided' });
    }

    // Execute SQL query to delete the student from the Student table
    const query = `
      DELETE FROM Student
      WHERE id = ?
    `;
    const values = [id];

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
    return NextResponse.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Internal Server Error' });
  }
}

// Function to update a student
export async function PUT(request, { params }) {
  try {
    const id = parseInt(params.id);
    const formData = await request.formData();

    // Extract data from form fields
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const password = formData.get('password');
    const age = formData.get('age');
    const major = formData.get('major');

    // Execute SQL query to update the student in the Student table
    const query = `
      UPDATE Student
      SET firstName = ?, lastName = ?, email = ?, password = ?, age = ?, major = ?
      WHERE id = ?
    `;
    const values = [firstName, lastName, email, password, age, major, id];

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
    return NextResponse.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Internal Server Error' });
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