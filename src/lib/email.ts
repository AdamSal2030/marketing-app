// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvitationEmail(email: string, token: string, invitedBy: string) {
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/signup/${token}`;

  const { error } = await resend.emails.send({
    from: 'Digital Agency <noreply@support.dnapricing.com>', // use verified sender in production
    to: email,
    subject: "You're invited to Digital Networking Agency Dashboard",
    html: `
      <h2>You're Invited!</h2>
      <p>${invitedBy} has invited you to join our platform.</p>
      <p><a href="${inviteUrl}">Click here to accept your invitation</a></p>
      <p>This link expires in 24 hours.</p>
      <p>— The DNA Team</p>
    `,
  });

  if (error) {
    console.error("Email sending failed:", error);
    return false;
  }

  return true;
}

export async function sendSignupNotificationEmails(newUser: {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
}) {
  const adminEmails = [
    'adamsaleem2030@gmail.com',
    'abdul.samad9k@gmail.com',
    'dna.agency00@gmail.com'
  ];

  const userName = newUser.first_name && newUser.last_name 
    ? `${newUser.first_name} ${newUser.last_name}` 
    : newUser.email;

  const emailPromises = adminEmails.map(adminEmail => 
    resend.emails.send({
      from: 'Digital Agency <noreply@support.dnapricing.com>',
      to: adminEmail,
      subject: '🎉 New User Signup - Digital Networking Agency Dashboard',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0; font-size: 24px;">🎉 New User Signup</h1>
              <div style="width: 50px; height: 3px; background: linear-gradient(135deg, #cbff00 0%, #9fff00 100%); margin: 10px auto;"></div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #495057; margin-top: 0; font-size: 18px;">User Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Name:</td>
                  <td style="padding: 8px 0; color: #333;">${userName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0; color: #333;">${newUser.email}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Role:</td>
                  <td style="padding: 8px 0;">
                    <span style="background-color: #cbff00; color: #000; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                      ${newUser.role.toUpperCase()}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">User ID:</td>
                  <td style="padding: 8px 0; color: #333; font-family: monospace;">${newUser.id}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6c757d; font-weight: bold;">Signup Time:</td>
                  <td style="padding: 8px 0; color: #333;">${new Date().toLocaleString()}</td>
                </tr>
              </table>
            </div>
            
            <div style="background-color: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin-bottom: 20px;">
              <p style="margin: 0; color: #155724;">
                <strong>✅ Action Required:</strong> You may want to review this new user account and assign appropriate permissions if needed.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/users" 
                 style="background: linear-gradient(135deg, #cbff00 0%, #9fff00 100%); 
                        color: #000; 
                        text-decoration: none; 
                        padding: 12px 30px; 
                        border-radius: 6px; 
                        font-weight: bold; 
                        display: inline-block;
                        transition: transform 0.2s ease;">
                View All Users
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <div style="text-align: center; color: #6c757d; font-size: 14px;">
              <p style="margin: 0;">Digital Networking Agency Dashboard</p>
              <p style="margin: 5px 0 0 0;">This is an automated notification email.</p>
            </div>
          </div>
        </div>
      `,
    })
  );

  try {
    const results = await Promise.allSettled(emailPromises);
    
    // Log results
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Signup notification sent successfully to ${adminEmails[index]}`);
      } else {
        console.error(`Failed to send signup notification to ${adminEmails[index]}:`, result.reason);
      }
    });

    // Return true if at least one email was sent successfully
    return results.some(result => result.status === 'fulfilled');
  } catch (error) {
    console.error("Error sending signup notification emails:", error);
    return false;
  }
}