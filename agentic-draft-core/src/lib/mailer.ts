import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(toEmail: string, token: string) {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to: toEmail,
    subject: "Verify your Agentic Draft account",
    html: `
      <p>Welcome to Agentic Draft!</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>If you didn't sign up for this, you can ignore this email.</p>
    `,
  });
}