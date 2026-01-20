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

export async function sendNotificationEmail(to: string | string[], subject: string, text: string) {
  if (!hasSmtpConfig()) {
    console.log(`[email] Skipping notification email (SMTP_* not configured) -> ${Array.isArray(to) ? to.join(',') : to}`);
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
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    text,
  });
}

export async function sendPasswordResetEmail(toEmail: string, resetUrl: string) {
  if (!hasSmtpConfig()) {
    console.log(`[email] Skipping password reset email (SMTP_* not configured) -> ${toEmail}`);
    console.log(`[email] Password reset link (dev): ${resetUrl}`);
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

  const subject = "Reset your CS2Stats password";
  const text = `A password reset was requested for your CS2Stats account.\n\nReset your password:\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`;
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
      <h2 style="margin: 0 0 12px;">Reset your CS2Stats password</h2>
      <p style="margin: 0 0 12px;">A password reset was requested for your CS2Stats account.</p>
      <p style="margin: 0 0 16px;">
        <a href="${resetUrl}" style="display:inline-block;padding:10px 14px;border-radius:8px;text-decoration:none;background:#2563eb;color:#fff;">
          Reset password
        </a>
      </p>
      <p style="margin: 0 0 12px; color: #6b7280; font-size: 14px;">
        If the button doesn't work, copy and paste this link into your browser:<br/>
        <a href="${resetUrl}">${resetUrl}</a>
      </p>
      <p style="margin: 0; color: #6b7280; font-size: 14px;">
        If you did not request this, you can safely ignore this email.
      </p>
    </div>
  `;

  await transporter.sendMail({
    from,
    to: toEmail,
    subject,
    text,
    html,
  });
}

