import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailPort = parseInt(process.env.EMAIL_PORT) || 587;
const isSecure = emailPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: emailPort,
  secure: isSecure,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS,
  },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) {
  console.warn('WARNING: ADMIN_EMAIL is not set — order notification emails will not be CCed to admin.');
}
const FROM_NAME = 'Homaura';
const FROM_EMAIL = process.env.EMAIL_USER;

/**
 * Escape user-supplied strings before embedding them in HTML email bodies.
 * Prevents stored XSS when product names, customer names, addresses, or
 * cancellation reasons contain HTML special characters.
 */
const escHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

const getEmailTemplate = (content) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Homaura</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f9f9f9;
          padding: 20px;
          line-height: 1.6;
        }
        .email-container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .email-header {
          background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
          padding: 40px 30px;
          text-align: center;
          color: white;
        }
        .email-header h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .email-header p {
          font-size: 14px;
          margin-top: 8px;
          opacity: 0.95;
        }
        .email-body {
          padding: 40px 30px;
          color: #333;
        }
        .email-body h2 {
          color: #ec4899;
          font-size: 24px;
          margin-bottom: 20px;
        }
        .email-body p {
          margin-bottom: 15px;
          color: #555;
          font-size: 15px;
        }
        .order-details {
          background: #fef2f8;
          border-left: 4px solid #ec4899;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .order-details h3 {
          color: #ec4899;
          font-size: 18px;
          margin-bottom: 15px;
        }
        .order-details p {
          margin: 8px 0;
          color: #333;
        }
        .order-details strong {
          color: #ec4899;
        }
        .product-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        .product-table th {
          background: #ec4899;
          color: white;
          padding: 12px;
          text-align: left;
          font-weight: 600;
        }
        .product-table td {
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
          color: #555;
        }
        .product-table tr:last-child td {
          border-bottom: none;
        }
        .total-section {
          background: #fef2f8;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 15px;
        }
        .total-row.grand-total {
          font-size: 20px;
          font-weight: 700;
          color: #ec4899;
          padding-top: 15px;
          border-top: 2px solid #ec4899;
          margin-top: 15px;
        }
        .delivery-info {
          background: #fff7ed;
          border-left: 4px solid #f97316;
          padding: 20px;
          margin: 25px 0;
          border-radius: 8px;
        }
        .delivery-info h3 {
          color: #f97316;
          font-size: 18px;
          margin-bottom: 10px;
        }
        .delivery-info p {
          color: #333;
          margin: 5px 0;
        }
        .email-footer {
          background: #f9f9f9;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e5e5;
        }
        .email-footer p {
          color: #777;
          font-size: 13px;
          margin: 5px 0;
        }
        .social-links {
          margin: 20px 0;
        }
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #ec4899;
          text-decoration: none;
          font-weight: 600;
        }
        .btn {
          display: inline-block;
          background: #ec4899;
          color: white;
          padding: 14px 30px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          margin: 20px 0;
          transition: background 0.3s;
        }
        .btn:hover {
          background: #db2777;
        }
        @media only screen and (max-width: 600px) {
          .email-header {
            padding: 30px 20px;
          }
          .email-header h1 {
            font-size: 26px;
          }
          .email-body {
            padding: 30px 20px;
          }
          .product-table th,
          .product-table td {
            padding: 8px;
            font-size: 13px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1>✨ Homaura</h1>
          <p>Inspire • Live • Elevate</p>
        </div>
        ${content}
        <div class="email-footer">
          <p><strong>Contact Us</strong></p>
          <p>📞 +91 73220 73770 | 📧 akshatsanghi900@gmail.com</p>
          <div class="social-links">
            <a href="https://www.instagram.com/akshat_sanghi_">Instagram</a> |
            <a href="https://wa.me/917322073770">WhatsApp</a>
          </div>
          <p style="margin-top: 20px; font-size: 12px;">
            © ${new Date().getFullYear()} Homaura. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const calculateTotal = (items) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  // Matches CartContext: free delivery when subtotal > 499
  const deliveryCharge = subtotal > 499 ? 0 : 499;
  const total = subtotal + deliveryCharge;
  return { subtotal, deliveryCharge, total };
};

const formatProductsTable = (items) => {
  return `
    <table class="product-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(item => `
          <tr>
            <td>${escHtml(item.product?.name || 'Product')}</td>
            <td>${escHtml(item.quantity)}</td>
            <td>₹${escHtml(item.price)}</td>
            <td>₹${escHtml(item.price * item.quantity)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
};

const extractCustomerDetails = (order) => {
  if (!order.message) return null;

  const lines = order.message.split('\n');
  const details = {};

  lines.forEach(line => {
    if (line.includes('Name:')) details.fullName = line.replace('Name:', '').trim();
    if (line.includes('Phone:')) details.phone = line.replace('Phone:', '').trim();
    if (line.includes('Email:')) details.email = line.replace('Email:', '').trim();
    if (line.includes('Address:')) details.address = line.replace('Address:', '').trim();
    if (line.includes('City:')) details.city = line.replace('City:', '').trim();
    if (line.includes('State:')) details.state = line.replace('State:', '').trim();
    if (line.includes('Pincode:')) details.pincode = line.replace('Pincode:', '').trim();
  });

  return details;
};

export async function sendOrderConfirmationEmail(order) {
  try {
    console.log('📧 Attempting to send order confirmation email for order:', order.id);

    const customerEmail = order.user?.email;
    const customerName = order.user?.name || 'Valued Customer';

    console.log('Customer email:', customerEmail);
    console.log('Customer name:', customerName);

    if (!customerEmail) {
      console.error('❌ Customer email not found for order:', order.id);
      return;
    }

    const { subtotal, deliveryCharge, total } = calculateTotal(order.items);
    const customerDetails = extractCustomerDetails(order);

    const safeCustomerName = escHtml(customerName);
    const content = `
      <div class="email-body">
        <h2>🎉 Order Confirmed!</h2>
        <p>Dear ${safeCustomerName},</p>
        <p>Thank you for your order! We're excited to prepare your special items.</p>

        <div class="order-details">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> #${escHtml(order.id)}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}</p>
        </div>

        ${formatProductsTable(order.items)}

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>₹${escHtml(subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Delivery Charge:</span>
            <span>${deliveryCharge === 0 ? 'FREE' : '₹' + escHtml(deliveryCharge)}</span>
          </div>
          ${deliveryCharge === 0 ? '<p style="font-size: 13px; color: #16a34a; margin-top: 5px;">🎉 You saved ₹499 on delivery!</p>' : ''}
          <div class="total-row grand-total">
            <span>Total Amount:</span>
            <span>₹${escHtml(total)}</span>
          </div>
        </div>

        ${customerDetails ? `
          <div class="delivery-info">
            <h3>📦 Delivery Information</h3>
            <p><strong>Name:</strong> ${escHtml(customerDetails.fullName || customerName)}</p>
            ${customerDetails.phone ? `<p><strong>Phone:</strong> ${escHtml(customerDetails.phone)}</p>` : ''}
            ${customerDetails.address ? `<p><strong>Address:</strong> ${escHtml(customerDetails.address)}</p>` : ''}
            ${customerDetails.city ? `<p><strong>City:</strong> ${escHtml(customerDetails.city)}</p>` : ''}
            ${customerDetails.state ? `<p><strong>State:</strong> ${escHtml(customerDetails.state)}</p>` : ''}
            ${customerDetails.pincode ? `<p><strong>Pincode:</strong> ${escHtml(customerDetails.pincode)}</p>` : ''}
            <p style="margin-top: 15px; color: #f97316; font-weight: 600;">⏱️ Estimated Delivery: 5-8 days</p>
          </div>
        ` : `
          <div class="delivery-info">
            <h3>📦 Delivery Information</h3>
            <p style="color: #f97316; font-weight: 600;">⏱️ Estimated Delivery: 5-8 days</p>
          </div>
        `}

        <p>We'll keep you updated on your order status. If you have any questions, feel free to reach out!</p>
      </div>
    `;

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: customerEmail,
      cc: ADMIN_EMAIL,
      subject: `Order Confirmed - Homaura #${order.id}`,
      html: getEmailTemplate(content),
    };

    console.log('📨 Sending email to:', customerEmail);
    console.log('📨 CC to:', ADMIN_EMAIL);
    console.log('📨 From:', `"${FROM_NAME}" <${FROM_EMAIL}>`);

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent successfully to ${customerEmail} and ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error('❌ Error sending order confirmation email:', error);
    console.error('Error details:', error.message);
    throw error;
  }
}

export async function sendOutForDeliveryEmail(order) {
  try {
    const customerEmail = order.user?.email;
    const customerName = order.user?.name || 'Valued Customer';

    if (!customerEmail) {
      console.error('Customer email not found for order:', order.id);
      return;
    }

    const content = `
      <div class="email-body">
        <h2>🚚 Your Order is Out for Delivery!</h2>
        <p>Dear ${escHtml(customerName)},</p>
        <p>Great news! Your order is on its way to you.</p>

        <div class="order-details">
          <h3>Order Information</h3>
          <p><strong>Order ID:</strong> #${escHtml(order.id)}</p>
          <p><strong>Status:</strong> Out for Delivery</p>
        </div>

        <div class="delivery-info">
          <h3>📦 Delivery Details</h3>
          <p style="color: #f97316; font-weight: 600; font-size: 16px;">⏱️ Estimated Delivery: 5-8 days</p>
          <p style="margin-top: 15px;">Your package will arrive soon. Please keep your phone handy for delivery updates.</p>
        </div>

        <p>Thank you for choosing Homaura! We hope your items bring joy to your home.</p>
      </div>
    `;

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Your Order is Out for Delivery! - Homaura #${order.id}`,
      html: getEmailTemplate(content),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Out for delivery email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending out for delivery email:', error);
    throw error;
  }
}

export async function sendOrderCancellationEmail(order, cancellationReason = '') {
  try {
    const customerEmail = order.user?.email;
    const customerName = order.user?.name || 'Valued Customer';

    if (!customerEmail) {
      console.error('Customer email not found for order:', order.id);
      return;
    }

    const { subtotal, deliveryCharge, total } = calculateTotal(order.items);

    const content = `
      <div class="email-body">
        <h2>❌ Order Cancelled</h2>
        <p>Dear ${escHtml(customerName)},</p>
        <p>Your order has been cancelled as requested.</p>

        <div class="order-details">
          <h3>Order Information</h3>
          <p><strong>Order ID:</strong> #${escHtml(order.id)}</p>
          <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
          <p><strong>Cancellation Date:</strong> ${new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
          ${cancellationReason ? `<p><strong>Reason:</strong> ${escHtml(cancellationReason)}</p>` : ''}
        </div>

        ${formatProductsTable(order.items)}

        <div class="total-section">
          <div class="total-row">
            <span>Order Amount:</span>
            <span>₹${escHtml(total)}</span>
          </div>
        </div>

        <div class="delivery-info" style="background: #fef3c7; border-left-color: #f59e0b;">
          <h3 style="color: #f59e0b;">💰 Refund Information</h3>
          <p>If payment was made, the refund will be processed within 5-7 business days to your original payment method.</p>
        </div>

        <p>We're sorry to see this order cancelled. We'd love to serve you again!</p>
        <p>Browse our collection and find the perfect items for your home.</p>
      </div>
    `;

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: customerEmail,
      subject: `Order Cancelled - Homaura #${order.id}`,
      html: getEmailTemplate(content),
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order cancellation email sent to ${customerEmail}`);
  } catch (error) {
    console.error('Error sending order cancellation email:', error);
    throw error;
  }
}

export async function sendOrderEmail(order) {
  return sendOrderConfirmationEmail(order);
}
