import nodemailer from "nodemailer";

function hasSmtpConfig() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendRegistrationEmail(toEmail: string) {
  if (!hasSmtpConfig()) {
    console.log(`[email] Skipping registration email (SMTP_* not configured) -> ${toEmail}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER!;

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: "Welcome to CS2Stats",
    text: "Welcome to CS2Stats! Your account has been created successfully.",
  });
}

