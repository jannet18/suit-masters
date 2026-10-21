export async function sendResetPasswordEmail(resend, { to, resetUrl }) {
    await resend.emails.send({
        from: "Suit Masters <onboarding@resend.dev>",
        to,
        subject: "Reset your Suit Masters password",
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0f0f0f; color: #f5f0eb; padding: 40px 30px; text-align: center; }
          .header h1 { font-size: 28px; letter-spacing: 0.15em; margin: 0; }
          .header p { color: #c9a96e; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; margin-top: 4px; }
          .content { background: #fff; padding: 40px 30px; border: 1px solid #eee; }
          .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; padding: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SUIT MASTERS</h1>
            <p>Bespoke Tailoring</p>
          </div>
          <div class="content">
            <h2>Reset your password</h2>
            <p>We received a request to reset the password for your Suit Masters account. This link expires in 1 hour.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #c9a96e; color: #0f0f0f; padding: 14px 32px; text-decoration: none; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; font-weight: bold;">Reset Password</a>
            </p>
            <p style="color: #999; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
          </div>
          <div class="footer">
            <p>Suit Masters &copy; ${new Date().getFullYear()}</p>
          </div>
        </div>
      </body>
      </html>
    `,
        text: `Reset your Suit Masters password\n\nWe received a request to reset your password. This link expires in 1 hour.\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
    });
}
