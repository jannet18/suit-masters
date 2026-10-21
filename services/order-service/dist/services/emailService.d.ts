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
export declare class EmailService {
    private isProduction;
    private resend;
    constructor();
    /**
     * Send order confirmation email
     */
    sendOrderConfirmation(data: OrderConfirmationData): Promise<boolean>;
    /**
     * Send order status update email
     */
    sendOrderStatusUpdate(email: string, orderId: number, status: string, updates?: string[]): Promise<boolean>;
    /**
     * Generate HTML for order confirmation email
     */
    private generateOrderConfirmationHtml;
    /**
     * Generate plain text for order confirmation email
     */
    private generateOrderConfirmationText;
}
export declare const emailService: EmailService;
//# sourceMappingURL=emailService.d.ts.map