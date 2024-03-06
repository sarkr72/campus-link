import { NextResponse } from "next/server";
import { getConnection } from "../../../../utils/db";
import { admin } from "../../../../utils/firebaseAdmin";
import { MongoAWSError } from "mongodb";
const db = admin.firestore();


export async function POST(request) {
  try {
    console.log("i am here")
    const requestData = await request.json();
    const { email, role } = requestData;
console.log("test: ", email)
    // Example response
    return {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'Success' }),
    };
  } catch (error) {
    console.error("Error processing request:", error);
    return {
      status: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}



// export async function GET(request, response) {
//     let connection;
//     try {
//       console.log("here")
//       const { param1, param2, role } = req.quer
//       console.log('Param 1:', param1);
//       console.log('Param 2:', param2);
//       console.log('Role:', role);
//       const responseData = await response.json();
//       console.log("response", responseData);

//       console.log("role, email11:")
//   console.log("role, email:", email, role)

//       let query;
//       if (role === "Student") {
//         query = `
//           SELECT Post.*, PostImage.imageUrl AS image
//           FROM Post
//           LEFT JOIN Student ON Post.userId = Student.id
//           LEFT JOIN PostImage ON Post.id = PostImage.postId
//           WHERE Student.email = ?
//         `;
//       } else if (role === "Professor") {
//         query = `
//           SELECT Post.*, PostImage.imageUrl AS image
//           FROM Post
//           LEFT JOIN Professor ON Post.userId = Professor.id
//           LEFT JOIN PostImage ON Post.id = PostImage.postId
//           WHERE Professor.email = ?
//         `;
//       } else if (role === "Admin") {
//         query = `
//           SELECT Post.*, PostImage.imageUrl AS image
//           FROM Post
//           LEFT JOIN Admin ON Post.userId = Admin.id
//           LEFT JOIN PostImage ON Post.id = PostImage.postId
//           WHERE Admin.email = ?
//         `;
//       }
  
//       connection = await getConnection();
//       const [rows] = await connection.query(query, [email]);
//       connection.release();
  
//       return NextResponse.json("rows");
//     } catch (error) {
//       if (connection) {
//         connection.release();
//       }
//       console.error("Error processing request:", error);
//       return NextResponse.error({ message: "Internal Server Error" });
//     }
//   }
  
