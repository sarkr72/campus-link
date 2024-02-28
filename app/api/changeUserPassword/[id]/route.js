import { NextResponse } from "next/server";
import { getConnection } from "../../../../utils/db";



export async function PUT(request, { params }) {
    let connection;
    try {
      console.log("updating user");
      const email = params.id;
      const { password } = await request.json();
   
      connection = await getConnection();
  
      const query = `
      UPDATE Student
      SET password = ?
      WHERE email = ?`;

    const values = [
      password,
      email,
    ];
  console.log("passss: ", password)
      // Execute the query
      await connection.query(query, values);
      connection.release();
      
      console.log("Student updated successfully");
  
      return NextResponse.json({ message: "Student updated successfully" });
    } catch (error) {
      console.error("Error updating student:", error);
      if (connection) {
        connection.release();
      }
      return NextResponse.json({ error: "Internal Server Error" });
    }
  }