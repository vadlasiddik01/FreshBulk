import { MailService } from '@sendgrid/mail';
import { Order, OrderStatusType } from '@shared/schema';

// Initialize SendGrid mail service
let mailService: MailService | null = null;

// Check if SendGrid API key is available and initialize the service
export function initializeEmailService() {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY environment variable not set. Email notifications will be disabled.");
    return false;
  }

  try {
    mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("Email service initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize email service:", error);
    return false;
  }
}

// Basic email params interface
interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

// Send email function
export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!mailService) {
    console.warn("Email service not initialized. Email not sent.");
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    console.log(`Email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

// Function to send order confirmation email
export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  const subject = `Order Confirmation - Order #${order.orderNumber}`;
  
  // Format items for the email
  const itemsText = JSON.parse(order.items as string)
    .map((item: any) => `${item.quantity} x ${item.productName} (${item.unit}) - $${item.total.toFixed(2)}`)
    .join('\n');
  
  const text = `
    Dear ${order.customerName},

    Thank you for your order! We've received your order and it's being processed.

    Order Details:
    Order Number: ${order.orderNumber}
    Date: ${order.createdAt.toLocaleDateString()}
    
    Items:
    ${itemsText}
    
    Total Amount: $${parseFloat(order.totalAmount).toFixed(2)}
    
    Delivery Address:
    ${order.deliveryAddress}
    ${order.deliveryCity}, ${order.deliveryPincode}
    
    We'll notify you when your order has been shipped.
    
    Thank you for shopping with us!
    
    The Fresh Bulk Orders Team
  `;

  return sendEmail({
    to: order.customerEmail,
    from: 'orders@freshbulkorders.com', // Update with your verified sender
    subject,
    text,
  });
}

// Function to send order status update email
export async function sendOrderStatusUpdate(order: Order, newStatus: OrderStatusType): Promise<boolean> {
  const subject = `Order Status Update - Order #${order.orderNumber}`;
  
  let statusMessage = '';
  switch(newStatus) {
    case 'In Progress':
      statusMessage = "Your order is now being prepared and will be shipped soon.";
      break;
    case 'Delivered':
      statusMessage = "Your order has been delivered. We hope you enjoy your fresh products!";
      break;
    default:
      statusMessage = `Your order status has been updated to: ${newStatus}`;
  }
  
  const text = `
    Dear ${order.customerName},

    We're writing to inform you that the status of your order #${order.orderNumber} has been updated.
    
    Current Status: ${newStatus}
    
    ${statusMessage}
    
    Order Details:
    Order Number: ${order.orderNumber}
    Date: ${order.createdAt.toLocaleDateString()}
    Total Amount: $${parseFloat(order.totalAmount).toFixed(2)}
    
    If you have any questions about your order, please don't hesitate to contact us.
    
    Thank you for shopping with us!
    
    The Fresh Bulk Orders Team
  `;

  return sendEmail({
    to: order.customerEmail,
    from: 'orders@freshbulkorders.com', // Update with your verified sender
    subject,
    text,
  });
}