import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { emailTemplate } from "@/app/components/EmailTemplate";

export async function POST(req, res) {
  try {
    const { user_name, user_location, user_city, user_email, user_phone } =
      await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.NEXT_PUBLIC_SMTP_HOST_API,
      port: parseInt(process.env.NEXT_PUBLIC_SMTP_PORT_API, 10),
      secure: true,
      auth: {
        user: process.env.NEXT_PUBLIC_SMTP_USER_API,
        pass: process.env.NEXT_PUBLIC_SMTP_PASS_API,
      },
    });

    const mailOptions = {
      from: process.env.NEXT_PUBLIC_SMTP_USER_API,
      to: "rinkusarkar353@gmail.com",
      subject: "testing email",
      html: emailTemplate.replace("{{name}}", "John"),
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.response);
    return NextResponse.json({
      success: true,
      message: "Your free trial request has bee sent!",
    });
  } catch (error) {
    console.error("Error:", error);
    return Response.json(
      {
        success: false,
        message: "Internal server error, please try again",
      },
      { status: 500 }
    );
  }
}
