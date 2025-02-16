export const mailtemplate = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Last-Mile Logistics</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f8f9fa;
      color: #333;
    }

    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .header {
      text-align: center;
      border-bottom: 2px solid #e9ecef;
      margin-bottom: 20px;
    }

    .header h1 {
      color: #007bff;
    }

    .content {
      line-height: 1.6;
    }

    .section {
      margin-bottom: 20px;
    }

    .order-status {
      border: 1px solid #dee2e6;
      border-radius: 5px;
      padding: 10px;
      margin-top: 10px;
    }

    .footer {
      text-align: center;
      color: #6c757d;
      font-size: 14px;
      margin-top: 20px;
    }

    .highlight {
      color: #007bff;
      font-weight: bold;
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Last-Mile Logistics</h1>
      <p>Your trusted partner for seamless e-commerce order tracking and management.</p>
    </div>

    <div class="content">
      <div class="section">
        <h2>Why Choose Us?</h2>
        <p>
          Our platform provides e-commerce sellers like <span class="highlight">Flipkart</span> and <span class="highlight">Amazon</span> with a
          powerful dashboard to track and manage all their orders in one place.
        </p>
      </div>

      <div class="section">
        <h2>Dashboard Features</h2>
        <ul>
          <li>View all orders placed across different platforms.</li>
          <li>Track the current status of each order.</li>
          <li>Access detailed order history and delivery logs.</li>
          <li>Analyze shipping charges, discounts, taxes, and total payments.</li>
        </ul>
      </div>

      <div class="section">
        <h2>Order Details</h2>
        <p>Each order includes the following information:</p>
        <ul>
          <li><strong>Courier Name:</strong> The courier service handling the delivery.</li>
          <li><strong>Tracking Number:</strong> Track your order in real-time.</li>
          <li><strong>Shipping Charges:</strong> Applied charges for shipping.</li>
          <li><strong>Discounts:</strong> Details of discounts applied.</li>
          <li><strong>Tax:</strong> Applicable taxes on the order.</li>
          <li><strong>Total Amount Paid:</strong> Final amount paid by the customer.</li>
        </ul>
      </div>

      <div class="section">
        <h2>Order Status and History</h2>
        <div class="order-status">
          <h3>Order History:</h3>
          <ul>
            <li>18 Nov 2024: Order Placed</li>
            <li>19 Nov 2024: Order Shipped</li>
            <li>20 Nov 2024: In Transit</li>
          </ul>
          <h3>In Transit:</h3>
          <p><strong>Expected Delays:</strong> Information about any delays.</p>
          <p><strong>Estimated Delivery Date:</strong> The estimated delivery date.</p>

          <h3>Delivered:</h3>
          <p><strong>Delivery Confirmation:</strong> Recipient details and confirmation.</p>
          <p><strong>Customer Feedback:</strong> Ratings and feedback from the customer.</p>
          <p><strong>Delivery Date and Time:</strong> When the order was delivered.</p>

          <h3>RTO (Return To Origin):</h3>
          <p><strong>Return Initiation Date:</strong> Date of return initiation.</p>
          <p><strong>Return Processing Date:</strong> Return processing completion.</p>
          <p><strong>Return Confirmation:</strong> Details and reasons for return.</p>

          <h3>NDR (Non-Delivery Report):</h3>
          <p><strong>NDR Attempts:</strong> Number of delivery attempts.</p>
          <p><strong>Next Steps:</strong> Planned actions for resolution.</p>
          <p><strong>Communication Log:</strong> Details of communication with the customer.</p>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing Last-Mile Logistics. Together, we simplify e-commerce logistics!</p>
    </div>
  </div>
</body>

</html>`;
