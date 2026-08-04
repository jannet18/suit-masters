import { Resend } from "resend";

declare const process: {
  env: {
    NODE_ENV?: string;
    RESEND_API_KEY?: string;
  };
};

/**
 * Simple email service for order confirmations and notifications
 * In production, integrate with SendGrid, Resend, or similar services
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderConfirmationData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  totalAmount: string;
  items: Array<{
    name: string;
    quantity: number;
    price: string;
    customization?: string;
  }>;
  shippingAddress: {
    name: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
  };
  estimatedDeliveryDate?: string;
  tailorNotes?: string;
}

export class EmailService {
  private isProduction = process.env.NODE_ENV === "production";
  private resend: Resend | null = null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (this.isProduction && apiKey) {
      this.resend = new Resend(apiKey);
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean> {
    try {
      const html = this.generateOrderConfirmationHtml(data);
      const text = this.generateOrderConfirmationText(data);

      const emailOptions: EmailOptions = {
        to: data.customerEmail,
        subject: `Order Confirmation #${data.orderId} - Suit Masters`,
        html,
        text,
      };

      // In development, log the email instead of sending
      if (!this.isProduction) {
        console.log("📧 [DEV] Order confirmation email would be sent:");
        console.log("To:", emailOptions.to);
        console.log("Subject:", emailOptions.subject);
        console.log("Preview:", text.substring(0, 200) + "...");
        return true;
      }

      // In production, send via Resend
      if (this.resend) {
        await this.resend.emails.send({
          from: "Suit Masters <orders@suitmasters.com>",
          to: emailOptions.to,
          subject: emailOptions.subject,
          html: emailOptions.html,
          text: emailOptions.text,
        });
      }

      console.log(
        `✅ Order confirmation email sent to ${data.customerEmail} for order #${data.orderId}`,
      );
      return true;
    } catch (error) {
      console.error("Failed to send order confirmation email:", error);
      return false;
    }
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdate(
    email: string,
    orderId: number,
    status: string,
    updates?: string[],
  ): Promise<boolean> {
    try {
      const subject = `Order #${orderId} Status Update - ${status}`;
      const html = `
        <h2>Order Status Update</h2>
        <p>Your order #${orderId} status has been updated to: <strong>${status}</strong></p>
        ${updates?.length ? `<ul>${updates.map((u) => `<li>${u}</li>`).join("")}</ul>` : ""}
        <p>You can track your order at: https://suitmasters.com/orders/${orderId}</p>
        <p>Thank you for choosing Suit Masters!</p>
      `;

      if (!this.isProduction) {
        console.log("📧 [DEV] Order status email would be sent:", {
          email,
          orderId,
          status,
        });
        return true;
      }

      if (this.resend) {
        await this.resend.emails.send({
          from: "Suit Masters <orders@suitmasters.com>",
          to: email,
          subject,
          html,
        });
      }
      return true;
    } catch (error) {
      console.error("Failed to send order status email:", error);
      return false;
    }
  }

  /**
   * Generate HTML for order confirmation email
   */
  private generateOrderConfirmationHtml(data: OrderConfirmationData): string {
    const itemsHtml = data.items
      .map(
        (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price}</td>
        ${item.customization ? `<td style="padding: 10px; border-bottom: 1px solid #eee;">${item.customization}</td>` : '<td style="padding: 10px; border-bottom: 1px solid #eee;">-</td>'}
      </tr>
    `,
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${data.orderId}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0f0f0f; color: #f5f0eb; padding: 30px; text-align: center; }
          .content { background: #fff; padding: 30px; border: 1px solid #ddd; }
          .footer { margin-top: 20px; text-align: center; color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #f5f5f5; padding: 10px; text-align: left; border-bottom: 2px solid #ddd; }
          .total-row { font-weight: bold; background: #f9f9f9; }
          .highlight { background: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Suit Masters</h1>
            <p>Tailored Excellence</p>
          </div>
          
          <div class="content">
            <h2>Order Confirmation #${data.orderId}</h2>
            <p>Dear ${data.customerName},</p>
            <p>Thank you for your order! We're excited to start crafting your custom suit.</p>
            
            <div class="highlight">
              <p><strong>Order Date:</strong> ${data.orderDate}</p>
              <p><strong>Order Total:</strong> ${data.totalAmount}</p>
              ${data.estimatedDeliveryDate ? `<p><strong>Estimated Delivery:</strong> ${data.estimatedDeliveryDate}</p>` : ""}
            </div>
            
            <h3>Order Details</h3>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Customization</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <h3>Shipping Address</h3>
            <p>
              ${data.shippingAddress.name}<br>
              ${data.shippingAddress.addressLine1}<br>
              ${data.shippingAddress.addressLine2 ? data.shippingAddress.addressLine2 + "<br>" : ""}
              ${data.shippingAddress.city}, ${data.shippingAddress.region} ${data.shippingAddress.postalCode}<br>
              ${data.shippingAddress.country}
            </p>
            
            ${
              data.tailorNotes
                ? `
            <div class="highlight">
              <h4>Tailor's Notes</h4>
              <p>${data.tailorNotes}</p>
            </div>
            `
                : ""
            }
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Our master tailors will review your measurements and customization details</li>
              <li>We'll contact you if we need any clarification</li>
              <li>You'll receive updates as your suit progresses through production</li>
              <li>Estimated delivery will be confirmed within 24 hours</li>
            </ul>
            
            <p>You can track your order at: <a href="https://suitmasters.com/orders/${data.orderId}">https://suitmasters.com/orders/${data.orderId}</a></p>
            
            <p>If you have any questions, please contact our customer service at support@suitmasters.com or call +1 (555) 123-4567.</p>
            
            <p>Thank you for choosing Suit Masters!</p>
            <p>Best regards,<br>The Suit Masters Team</p>
          </div>
          
          <div class="footer">
            <p>Suit Masters &copy; ${new Date().getFullYear()}</p>
            <p>123 Tailor Street, Fashion District, NY 10001</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate plain text for order confirmation email
   */
  private generateOrderConfirmationText(data: OrderConfirmationData): string {
    const itemsText = data.items
      .map(
        (item) =>
          `- ${item.name} x${item.quantity}: ${item.price}${item.customization ? ` (${item.customization})` : ""}`,
      )
      .join("\n");

    return `
Order Confirmation #${data.orderId} - Suit Masters

Dear ${data.customerName},

Thank you for your order! We're excited to start crafting your custom suit.

ORDER SUMMARY:
Order Date: ${data.orderDate}
Order Total: ${data.totalAmount}
${data.estimatedDeliveryDate ? `Estimated Delivery: ${data.estimatedDeliveryDate}\n` : ""}

ITEMS:
${itemsText}

SHIPPING ADDRESS:
${data.shippingAddress.name}
${data.shippingAddress.addressLine1}
${data.shippingAddress.addressLine2 ? data.shippingAddress.addressLine2 + "\n" : ""}
${data.shippingAddress.city}, ${data.shippingAddress.region} ${data.shippingAddress.postalCode}
${data.shippingAddress.country}

${data.tailorNotes ? `TAILOR'S NOTES:\n${data.tailorNotes}\n\n` : ""}
NEXT STEPS:
- Our master tailors will review your measurements and customization details
- We'll contact you if we need any clarification
- You'll receive updates as your suit progresses through production
- Estimated delivery will be confirmed within 24 hours

Track your order: https://suitmasters.com/orders/${data.orderId}

If you have any questions, please contact our customer service at support@suitmasters.com or call +1 (555) 123-4567.

Thank you for choosing Suit Masters!

Best regards,
The Suit Masters Team

Suit Masters © ${new Date().getFullYear()}
123 Tailor Street, Fashion District, NY 10001
    `.trim();
  }
}

// Singleton instance
export const emailService = new EmailService();
