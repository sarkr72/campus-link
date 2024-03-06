import { NextResponse } from "next/server";
import { getConnection } from "../../../utils/db";


export async function POST(request, response) {
    let connection;
    try {
        const requestData = await request.json();
        const { userId } = requestData;
        connection = await getConnection();

        // Retrieve likes for the given userId
        const likesQuery = `
            SELECT *
            FROM Likes
            WHERE userId = ?
        `;
        const [likesResult] = await connection.query(likesQuery, [userId]);

        // Retrieve comments for the given userId
        const commentsQuery = `
            SELECT *
            FROM Comments
            WHERE userId = ?
        `;
        const [commentsResult] = await connection.query(commentsQuery, [userId]);

        connection.release();

        // Return both likes and comments in the response
        return response.json({ likes: likesResult, comments: commentsResult });
    } catch (error) {
        if (connection) {
            connection.release();
        }
        console.error("Error processing request:", error);
        return response.error({ message: "Internal Server Error" });
    }
}



