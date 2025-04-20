import { Resend } from 'resend';
import { Order, OrderItem, OrderStatusType } from "@shared/schema";
import { formatOrderNumber, formatPrice } from "../client/src/lib/formatters";
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export function initializeEmailService() {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set. Email sending will be disabled.");
    return;
  }
  console.log("Resend email service initialized.");
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Email not sent: RESEND_API_KEY missing.");
    return false;
  }

  try {
    await resend.emails.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || params.html?.replace(/<[^>]*>/g, '') || '',
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

function renderOrderItems(items: OrderItem[]): string {
  return items.map(
    (item) => `
      <li>
        ${item.productName}: ${item.quantity} ${item.unit} x ${formatPrice(item.price)} = ${formatPrice(item.total)}
      </li>
    `
  ).join("");
}

export async function sendOrderConfirmation(order: Order): Promise<boolean> {
  const formattedOrderNumber = formatOrderNumber(order.orderNumber);
  const totalAmount = formatPrice(Number(order.totalAmount));

  const itemsList = renderOrderItems(order.items as OrderItem[]);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #4CAF50;">FreshBulk - Order Confirmation #${formattedOrderNumber}</h2>
      <p>Hello ${order.customerName},</p>
      <p>Thank you for your order. We're processing it and will update you shortly.</p>

      <div style="margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
        <p><strong>Order Number:</strong> ${formattedOrderNumber}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
        <p><strong>Total:</strong> ${totalAmount}</p>
        <h4>Items:</h4>
        <ul style="padding-left: 20px;">${itemsList}</ul>

        <h4>Delivery Address:</h4>
        <p>
          ${order.deliveryAddress},<br>
          ${order.deliveryCity} - ${order.deliveryPincode}
        </p>
      </div>

      <p>If you have any questions, reach out to support@freshbulk.com.</p>
      <footer style="margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #ccc; padding-top: 20px; text-align: center;">
        &copy; ${new Date().getFullYear()} FreshBulk. All rights reserved.
      </footer>
    </div>
  `;

  const text = `
FreshBulk - Order Confirmation #${formattedOrderNumber}

Hello ${order.customerName},

Thank you for your order. We're processing it.

Order Number: ${formattedOrderNumber}
Order Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status}
Total: ${totalAmount}

Delivery Address:
${order.deliveryAddress}, ${order.deliveryCity} - ${order.deliveryPincode}

If you have questions, contact support@freshbulk.com
  `;

  return sendEmail({
    to: order.customerEmail,
    from: 'Acme <onboarding@resend.dev>', // Verified sender
    subject: `FreshBulk Order Confirmation - #${formattedOrderNumber}`,
    text,
    html,
  });
}

export async function sendOrderStatusUpdate(order: Order, newStatus: OrderStatusType): Promise<boolean> {
  const formattedOrderNumber = formatOrderNumber(order.orderNumber);

  const statusMsgMap: Record<OrderStatusType, string> = {
    Pending: "Your order has been received and is pending.",
    "In Progress": "Your order is being prepared.",
    Delivered: "Your order has been delivered.",
  };

  const message = statusMsgMap[newStatus] || `Your order status is now: ${newStatus}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #4CAF50;">FreshBulk - Order Update #${formattedOrderNumber}</h2>
      <p>Hello ${order.customerName},</p>
      <p>${message}</p>

      <div style="margin-top: 20px; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
        <p><strong>Order Number:</strong> ${formattedOrderNumber}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <p>Contact support@freshbulk.com for any help.</p>

      <footer style="margin-top: 30px; font-size: 12px; color: #888; border-top: 1px solid #ccc; padding-top: 20px; text-align: center;">
        &copy; ${new Date().getFullYear()} FreshBulk. All rights reserved.
      </footer>
    </div>
  `;

  const text = `
FreshBulk - Order Update #${formattedOrderNumber}

Hello ${order.customerName},

${message}

Order Number: ${formattedOrderNumber}
New Status: ${newStatus}
Order Date: ${new Date(order.createdAt).toLocaleDateString()}

Contact support@freshbulk.com for help.
  `;

  return sendEmail({
    to: order.customerEmail,
    from: 'Acme <onboarding@resend.dev>',
    subject: `FreshBulk Order Status Update - #${formattedOrderNumber}`,
    text,
    html,
  });
}
