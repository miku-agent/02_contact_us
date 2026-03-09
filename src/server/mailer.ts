import nodemailer from "nodemailer";

export function isMailEnabled() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.MAIL_FROM &&
      process.env.MAIL_TO
  );
}

export async function sendContactMail(params: {
  name: string;
  email: string;
  message: string;
}) {
  if (!isMailEnabled()) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });

  const subject = `[contact] ${params.name} <${params.email}>`;

  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO,
    replyTo: params.email,
    subject,
    text: params.message,
  });
}
