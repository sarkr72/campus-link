
import { NextResponse } from "next/server";
import connection from "../../../utils/db";

export async function GET(request) {
    try {
        const updateQuery = `
            UPDATE Student
            SET isSignedIn = false
            WHERE isSignedIn = true
        `;

        await new Promise((resolve, reject) => {
            connection.query(updateQuery, (error, results) => {
                if (error) {
                    console.error("Error executing SQL update query:", error);
                    reject(error);
                } else {
                    console.log("Successfully updated isSignedIn for signed-in users");
                    resolve(results);
                }
            });
        });

        // Return success response indicating successful update
        return NextResponse.json({ message: "Successfully updated isSignedIn for signed-in users" });
    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.error({ message: "Internal Server Error" });
    }
}