// pages/api/auth/login.js
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
        // If the email does not exist, return an error response
        return NextResponse.json( { error: 'Input data not found' } );
      }

    // Check if the email exists in the database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // If the email does not exist, return an error response
      return NextResponse.json({ error: 'Email not found' });
    }
    
    return NextResponse.json({ message: 'Email found. Proceed with login.' });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json({ error: error.message });
  }
}
