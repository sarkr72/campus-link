// import { NestResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { Allura } from "next/font/google";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        const data = await request.json();
        console.log("data", data);
        const {name, email} = data;
      // Check if the email address already exists in the database
      const existingUser = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });
  
      if (existingUser) {
        // If the email address already exists, return an error response
        return NextResponse.error({
          status: 400,
          message: "User with this email already exists",
        });
      } else {
        // If the email address doesn't exist, create a new user
        const newUser = await prisma.user.create({
          data: {
            name,
            email,
          },
        });
  
        // Return the newly created user
        return NextResponse.json(newUser);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      // Return an error response for internal server error
      return NextResponse.error({
        status: 500,
        message: "Internal server error",
      });
    }
  }
  
// get all users
export async function GET(req, res) {
  try {
    const allUsers = await prisma.user.findMany();
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}
