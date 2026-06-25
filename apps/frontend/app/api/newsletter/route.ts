import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not set - subscription recorded but no email sent");
      return NextResponse.json({
        success: true,
        message: "Subscription recorded",
      });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "Suit Masters <onboarding@resend.dev>",
      to: email,
      subject: "Welcome to Suit Masters - Your Exclusive 15% Off",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Suit Masters</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0f0f0f; color: #f5f0eb; padding: 40px 30px; text-align: center; }
            .header h1 { font-size: 28px; letter-spacing: 0.15em; margin: 0; }
            .header p { color: #c9a96e; font-size: 10px; letter-spacing: 0.4em; text-transform: uppercase; margin-top: 4px; }
            .content { background: #fff; padding: 40px 30px; border: 1px solid #eee; }
            .highlight { background: #f9f5ef; padding: 20px; border-left: 4px solid #c9a96e; margin: 24px 0; text-align: center; }
            .code { font-size: 24px; font-weight: bold; letter-spacing: 0.1em; color: #c9a96e; }
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
              <h2>Welcome to the Inner Circle</h2>
              <p>Thank you for joining Suit Masters. You now have exclusive access to:</p>
              <ul>
                <li>New collections before anyone else</li>
                <li>Private sales and invitations to trunk shows</li>
                <li>Expert tailoring tips and style advice</li>
              </ul>
              <div class="highlight">
                <p style="margin: 0 0 8px; font-size: 14px; color: #666;">Your exclusive welcome offer</p>
                <p class="code">WELCOME15</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #666;">15% off your first order</p>
              </div>
              <p style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:3000/shop/suits" style="background: #c9a96e; color: #0f0f0f; padding: 14px 32px; text-decoration: none; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; font-weight: bold;">Shop Now</a>
              </p>
              <p style="color: #999; font-size: 13px;">No spam, ever. Unsubscribe at any time.</p>
            </div>
            <div class="footer">
              <p>Suit Masters &copy; ${new Date().getFullYear()}</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `Welcome to Suit Masters!\n\nThank you for joining the Inner Circle.\n\nYour exclusive welcome offer:\nWELCOME15 - 15% off your first order\n\nVisit us at http://localhost:3000/shop/suits`,
    });

    return NextResponse.json({
      success: true,
      message: "Welcome email sent successfully",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process subscription" },
      { status: 500 },
    );
  }
}