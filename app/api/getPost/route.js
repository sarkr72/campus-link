import { NextResponse } from "next/server";
import { getConnection } from "../../../utils/db";
import { admin } from "../../../utils/firebaseAdmin";
const db = admin.firestore();

export async function POST(request, response) {
  let connection;
  try {
    const requestData = await request.json();
    const { email, role } = requestData;

    let query;
    if (role.toLowerCase() === "student") {
      query = `
      SELECT 
    Post.*, 
    PostImage.imageUrl AS image,
    (SELECT GROUP_CONCAT(CONCAT(Student.firstName, ' ', Student.lastName, ',', Student.profilePicture) SEPARATOR ';') 
     FROM Likes
     LEFT JOIN Student ON Likes.userId = Student.id
     WHERE Likes.postId = Post.id) AS likedBy
FROM 
    Post
LEFT JOIN 
    PostImage ON Post.id = PostImage.postId;

        `;
    } else if (role === "Professor") {
      query = `
          SELECT Post.*, PostImage.imageUrl AS image
          FROM Post
          LEFT JOIN Professor ON Post.userId = Professor.id
          LEFT JOIN PostImage ON Post.id = PostImage.postId
          WHERE Professor.email = ?
        `;
    } else if (role === "Admin") {
      query = `
          SELECT Post.*, PostImage.imageUrl AS image
          FROM Post
          LEFT JOIN Admin ON Post.userId = Admin.id
          LEFT JOIN PostImage ON Post.id = PostImage.postId
          WHERE Admin.email = ?
        `;
    }

    connection = await getConnection();
    const [rows] = await connection.query(query);
    await connection.release();
    console.log("dddd", rows);
    return NextResponse.json(rows);
  } catch (error) {
    if (connection) {
      await connection.release();
    }
    console.error("Error processing request:", error);
    return NextResponse.error({ message: "Internal Server Error" });
  }
}
