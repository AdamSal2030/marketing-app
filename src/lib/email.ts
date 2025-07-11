// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(email: string, token: string, invitedBy: string) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup/${token}`;

  const { error } = await resend.emails.send({
    from: 'Digital Agency <noreply@usa-today.tv>', // use verified sender in production
    to: email,
    subject: "You're invited to Digital Marketing Agency Dashboard",
    html: `
      <h2>You're Invited!</h2>
      <p>${invitedBy} has invited you to join our platform.</p>
      <p><a href="${inviteUrl}">Click here to accept your invitation</a></p>
      <p>This link expires in 24 hours.</p>
      <p>— The DMA Team</p>
    `,
  });

  if (error) {
    console.error("Email sending failed:", error);
    return false;
  }

  return true;
}
