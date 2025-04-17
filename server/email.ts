import { MailService } from "@sendgrid/mail";
import { Order, OrderStatusType } from "@shared/schema";
import { formatOrderNumber, formatPrice } from "../client/src/lib/formatters";

// Initialize the SendGrid mail service
const mailService = new MailService();

export function initializeEmailService() {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("SENDGRID_API_KEY environment variable is not set. Email functionality will be limited.");
    return;
  }

  try {
    mailService.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("Email service initialized successfully");
  } catch (error) {
    console.error("Failed to initialize email service:", error);
  }
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn("Cannot send email: SENDGRID_API_KEY is not set");
    return false;
  }

  try {
    await mailService.send({
      to: params.to,
      from: {
        email: params.from,
        name: "FreshBulk Orders",
      },
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  const formattedOrderNumber = formatOrderNumber(order.orderNumber);
  const totalAmount = formatPrice(order.totalAmount);
  
  // Create a list of ordered items
  const itemsList = order.items.map(item => 
    `<li>${item.name}: ${item.quantity} x ${formatPrice(item.price)} = ${formatPrice(item.quantity * item.price)}</li>`
  ).join("");
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Order Confirmation - #${formattedOrderNumber}</h2>
      <p>Hello ${order.customerName},</p>
      <p>Thank you for your order with FreshBulk. Your order has been received and is being processed.</p>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <h3 style="margin-top: 0;">Order Details:</h3>
        <p><strong>Order Number:</strong> ${formattedOrderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total Amount:</strong> ${totalAmount}</p>
        
        <h4 style="margin-bottom: 5px;">Ordered Items:</h4>
        <ul style="padding-left: 20px;">
          ${itemsList}
        </ul>
        
        <h4 style="margin-bottom: 5px;">Delivery Address:</h4>
        <p style="margin: 0;">
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}
        </p>
      </div>
      
      <p>You can track your order status by using the order tracking feature on our website with your order number: <strong>${formattedOrderNumber}</strong></p>
      
      <p>If you have any questions or need assistance, please contact our customer support team at support@freshbulk.com or call us at +91 1234567890.</p>
      
      <p>Thank you for choosing FreshBulk!</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center; color: #777; font-size: 12px;">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; ${new Date().getFullYear()} FreshBulk. All rights reserved.</p>
      </div>
    </div>
  `;
  
  const textContent = `
    Order Confirmation - #${formattedOrderNumber}
    
    Hello ${order.customerName},
    
    Thank you for your order with FreshBulk. Your order has been received and is being processed.
    
    Order Details:
    Order Number: ${formattedOrderNumber}
    Order Date: ${new Date(order.createdAt).toLocaleDateString()}
    Status: ${order.status}
    Total Amount: ${totalAmount}
    
    You can track your order status by using the order tracking feature on our website with your order number: ${formattedOrderNumber}
    
    If you have any questions or need assistance, please contact our customer support team at support@freshbulk.com or call us at +91 1234567890.
    
    Thank you for choosing FreshBulk!
  `;
  
  return sendEmail({
    to: order.customerEmail,
    from: "orders@freshbulk.com",
    subject: `FreshBulk Order Confirmation - #${formattedOrderNumber}`,
    text: textContent,
    html: htmlContent,
  });
}

export async function sendOrderStatusUpdate(order: Order, newStatus: OrderStatusType): Promise<boolean> {
  const formattedOrderNumber = formatOrderNumber(order.orderNumber);
  
  let statusMessage = "";
  switch (newStatus) {
    case "Processing":
      statusMessage = "Your order is now being processed. We'll update you when it's ready for shipping.";
      break;
    case "Shipped":
      statusMessage = "Great news! Your order has been shipped and is on its way to you.";
      break;
    case "Delivered":
      statusMessage = "Your order has been delivered successfully. We hope you enjoy your fresh produce!";
      break;
    case "Cancelled":
      statusMessage = "Your order has been cancelled as requested. If you have any questions, please contact our support team.";
      break;
    default:
      statusMessage = `Your order status has been updated to ${newStatus}.`;
  }
  
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4CAF50;">Order Status Update - #${formattedOrderNumber}</h2>
      <p>Hello ${order.customerName},</p>
      <p>${statusMessage}</p>
      
      <div style="margin: 20px 0; padding: 15px; border: 1px solid #e1e1e1; border-radius: 5px;">
        <h3 style="margin-top: 0;">Order Details:</h3>
        <p><strong>Order Number:</strong> ${formattedOrderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>New Status:</strong> <span style="font-weight: bold; color: #4CAF50;">${newStatus}</span></p>
      </div>
      
      <p>You can track your order status by using the order tracking feature on our website with your order number: <strong>${formattedOrderNumber}</strong></p>
      
      <p>If you have any questions or need assistance, please contact our customer support team at support@freshbulk.com or call us at +91 1234567890.</p>
      
      <p>Thank you for choosing FreshBulk!</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e1e1e1; text-align: center; color: #777; font-size: 12px;">
        <p>This is an automated email. Please do not reply to this message.</p>
        <p>&copy; ${new Date().getFullYear()} FreshBulk. All rights reserved.</p>
      </div>
    </div>
  `;
  
  const textContent = `
    Order Status Update - #${formattedOrderNumber}
    
    Hello ${order.customerName},
    
    ${statusMessage}
    
    Order Details:
    Order Number: ${formattedOrderNumber}
    Order Date: ${new Date(order.createdAt).toLocaleDateString()}
    New Status: ${newStatus}
    
    You can track your order status by using the order tracking feature on our website with your order number: ${formattedOrderNumber}
    
    If you have any questions or need assistance, please contact our customer support team at support@freshbulk.com or call us at +91 1234567890.
    
    Thank you for choosing FreshBulk!
  `;
  
  return sendEmail({
    to: order.customerEmail,
    from: "orders@freshbulk.com",
    subject: `FreshBulk Order Status Update - #${formattedOrderNumber}`,
    text: textContent,
    html: htmlContent,
  });
}