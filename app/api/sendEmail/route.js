import nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { emailTemplate } from "@/app/components/EmailTemplate";

export async function POST(request, res) {
  try {
    // const  requestBody   = await req.json();
    const requestData = await request.json();
    const text = requestData.message;
    const emailTo = requestData.emailTo;
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST_API,
      port: parseInt(process.env.SMTP_PORT_API, 10),
      secure: true,
      auth: {
        user: process.env.SMTP_USER_API,
        pass: process.env.SMTP_PASS_API,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_USER_API,
      to: emailTo,
      subject: "testing email",
      html: emailTemplate.replace("{{message}}", text),
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
