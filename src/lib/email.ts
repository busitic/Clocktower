/*
  One function for all outgoing email.
  - SMTP configured in .env: sends a real email.
  - Not configured (normal in development): prints the email, including the
    reset link, to the terminal running `npm run dev`.
  - In production with no SMTP: throws, so a reset link is never logged on a server.
*/
export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP is not configured");
    }
    console.log(`\n[email not sent: SMTP not configured]\nTo: ${to}\nSubject: ${subject}\n\n${text}\n`);
    return;
  }

  const { createTransport } = await import("nodemailer");
  const port = Number(SMTP_PORT ?? 465);
  const transporter = createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({ from: EMAIL_FROM ?? SMTP_USER, to, subject, text });
}