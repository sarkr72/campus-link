// Import the necessary modules
import { NextResponse } from "next/server";
// import connection from "../../../utils/db";

export async function POST(request) {
  try {
    // const formData = await request.formData();
    // const email = formData.get("email");
    // const password = formData.get("password");

    // if (!email || !password) {
    //   // If the email or password is missing, return an error response
    //   return NextResponse.json({ error: "Email or password not provided" });
    // }

    // // Execute SQL query to fetch user by email from Student table
    // const query = `
    //     SELECT * FROM Student
    //     WHERE email = ?
    //   `;
    // const values = [email];

    // const user = await new Promise((resolve, reject) => {
    //   connection.query(query, values, (error, results) => {
    //     if (error) {
    //       console.error("Error executing SQL query:", error);
    //       reject(error);
    //     } else {
    //       resolve(results[0]); // Assuming there is only one user with the given email
    //     }
    //   });
    // });

    // if (!user) {
    //   // If the user with the provided email does not exist, return an error response
    //   return NextResponse.json({ error: "User not found" });
    // }

    // // Compare the provided password with the password retrieved from the database
    // if (user.password !== password) {
    //   // If the passwords do not match, return an error response
    //   return NextResponse.json({ error: "Incorrect password" });
    // }

    // // Update the isSignedIn column to true for the logged-in user
    // // If the email and password match, update the isSignedIn column to true
    // const updateQuery = `
    //     UPDATE Student
    //     SET isSignedIn = true
    //     WHERE email = ?
    //   `;
    // const updateValues = [email];

    // await new Promise((resolve, reject) => {
    //   connection.query(updateQuery, updateValues, (error, results) => {
    //     if (error) {
    //       console.error("Error updating isSignedIn column:", error);
    //       reject(error);
    //     } else {
    //       resolve(results);
    //     }
    //   });
    // });

    // // If the email and password match, return a success response
    return NextResponse.json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: "Internal Server Error" });
  }
}
