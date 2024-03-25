// import { NextResponse } from "next/server";
// import { getConnection } from "../../../utils/db";
// import { admin } from "../../../utils/firebaseAdmin";
// const db = admin.firestore();

// export async function POST(request, response) {
//   let connection;
//   try {
//     const requestData = await request.json();
//     const { postId, userId } = requestData;
//     connection = await getConnection();

//     const selectQuery = `
//     SELECT COUNT(*) AS count
//     FROM \`Likes\`
//     WHERE postId = ? AND userId = ?
// `;

//     const [result] = await connection.query(selectQuery, [postId, userId]);

//     if (result[0].count > 0) {
//       await connection.release();
//       return NextResponse.error({
//         message: "Combination already exists in Like table",
//       });
//     }

//     const insertQuery = `
//             INSERT INTO Likes (postId, userId)
//             VALUES (?, ?)
//         `;
//     await connection.query(insertQuery, [postId, userId]);

//     const decrementQuery = `
//     UPDATE Post
//     SET likesCount = likesCount + 1
//     WHERE id = ? AND userId = ?
// `;

//     await connection.query(decrementQuery, [postId, userId]);

//     await connection.release();
//     return NextResponse.json({ message: "Data inserted successfully" });
//   } catch (error) {
//     if (connection) {
//       await connection.release();
//     }
//     console.error("Error processing request:", error);
//     return NextResponse.error({ message: "Internal Server Error" });
//   }
// }
