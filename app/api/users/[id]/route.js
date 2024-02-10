import { PrismaClient } from "@prisma/client";
import { Allura } from "next/font/google";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();


export async function GET(req, { params }) {
    try {
      // const allUsers = await prisma.user.findMany();
      // return NextResponse.json(allUsers);
  
      const id = parseInt(params.id);
      const users = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      console.log('ssss', users)
      return NextResponse.json(users)
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }