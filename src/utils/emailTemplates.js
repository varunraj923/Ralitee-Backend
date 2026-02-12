const getOrderConfirmationEmailHtml = (order, user, orderItems) => {
    const { shippingAddress, totalAmount, _id, createdAt } = order;
    const orderDate = new Date(createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const itemsHtml = orderItems.map(item => {
        const product = item.product;
        // Handle images: check thumbnail, then images array, then placeholder
        let imageUrl = "https://via.placeholder.com/80";
        if (product.thumbnail) {
            imageUrl = product.thumbnail;
        } else if (product.images && product.images.length > 0) {
            imageUrl = product.images[0];
        }

        return `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <img src="${imageUrl}" alt="${product.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <div style="font-weight: 600; color: #333;">${product.name}</div>
                <div style="color: #777; font-size: 12px;">Size: ${item.size || 'N/A'} | Color: ${item.color || 'N/A'}</div>
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price}</td>
        </tr>
        `;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background-color: #1a1a1a; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">Ralitee</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.8;">Order Confirmation</p>
        </div>

        <!-- content -->
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Hello <strong>${user.name || 'Valued Customer'}</strong>,</p>
            <p style="color: #555;">Thank you for shopping with Ralitee! We've received your order and are getting it ready for shipment.</p>

            <!-- Order Info -->
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; display: flex; justify-content: space-between; flex-wrap: wrap;">
                <div>
                    <span style="display: block; font-size: 12px; color: #777;">Order ID</span>
                    <span style="font-weight: 600;">#${_id}</span>
                </div>
                <div>
                    <span style="display: block; font-size: 12px; color: #777;">Date</span>
                    <span style="font-weight: 600;">${orderDate}</span>
                </div>
                <div>
                    <span style="display: block; font-size: 12px; color: #777;">Total</span>
                    <span style="font-weight: 600; color: #2ecc71;">₹${totalAmount}</span>
                </div>
            </div>

            <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px;">Items Ordered</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background-color: #f9f9f9; text-align: left;">
                        <th style="padding: 10px;">Item</th>
                        <th style="padding: 10px;">Details</th>
                        <th style="padding: 10px; text-align: center;">Qty</th>
                        <th style="padding: 10px; text-align: right;">Price</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 15px; text-align: right; font-weight: 600;">Subtotal:</td>
                        <td style="padding: 15px; text-align: right;">₹${totalAmount}</td>
                    </tr>
                     <tr>
                        <td colspan="3" style="padding: 5px 15px; text-align: right; font-weight: 600;">Shipping:</td>
                        <td style="padding: 5px 15px; text-align: right;">Free</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 15px; text-align: right; font-weight: 700; font-size: 16px;">Total Amount:</td>
                        <td style="padding: 15px; text-align: right; font-weight: 700; font-size: 16px;">₹${totalAmount}</td>
                    </tr>
                </tfoot>
            </table>

            <!-- Shipping Address -->
            <h3 style="border-bottom: 2px solid #eee; padding-bottom: 10px; margin-top: 30px;">Shipping Address</h3>
            <div style="font-size: 14px; color: #555; background: #f9f9f9; padding: 15px; border-radius: 6px;">
                <p style="margin: 0 0 5px; font-weight: 600; color: #333;">${shippingAddress.fullName}</p>
                <p style="margin: 0 0 5px;">${shippingAddress.street}</p>
                <p style="margin: 0 0 5px;">${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zip}</p>
                <p style="margin: 0 0 5px;">${shippingAddress.country}</p>
                <p style="margin: 10px 0 0;"><strong>Phone:</strong> ${shippingAddress.phone}</p>
            </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1a1a1a; color: #888; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0 0 10px;">&copy; ${new Date().getFullYear()} Ralitee. All rights reserved.</p>
            <p style="margin: 0;">Need help? Contact us at <a href="mailto:support@ralitee.com" style="color: #fff; text-decoration: underline;">support@ralitee.com</a></p>
        </div>
    </div>
</body>
</html>
    `;
};


const getAdminOrderEmailHtml = (order, user, orderItems) => {
    const { shippingAddress, totalAmount, _id, createdAt } = order;
    const orderDate = new Date(createdAt).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const itemsHtml = orderItems.map(item => `
        <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                <strong>${item.product.name}</strong><br>
                <span style="font-size: 12px; color: #666;">ID: ${item.product._id}</span>
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                Size: ${item.size || '-'} <br> Color: ${item.color || '-'}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price}</td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head><title>New Order Alert</title></head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; color: #333; background-color: #f0f0f0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 5px; border-top: 5px solid #d9534f;">
        <h2 style="color: #d9534f; margin-top: 0;">🔔 New Order Received!</h2>
        <p><strong>Order ID:</strong> ${_id}</p>
        <p><strong>Date:</strong> ${orderDate}</p>

        <div style="background: #e9ecef; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">👤 Customer Details</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${user.name}</p>
            <p style="margin: 5px 0;"><strong>User ID:</strong> ${user._id}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> <a href="mailto:${user.email}">${user.email}</a></p>
        </div>

        <div style="background: #e9ecef; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; border-bottom: 1px solid #ccc; padding-bottom: 5px;">🚚 Shipping Address</h3>
            <p style="margin: 5px 0;"><strong>${shippingAddress.fullName}</strong></p>
            <p style="margin: 5px 0;">${shippingAddress.street}</p>
            <p style="margin: 5px 0;">${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zip}</p>
            <p style="margin: 5px 0;">${shippingAddress.country}</p>
            <p style="margin: 10px 0 0; font-size: 16px;"><strong>📞 Phone: <a href="tel:${shippingAddress.phone}">${shippingAddress.phone}</a></strong></p>
        </div>

        <h3 style="border-bottom: 2px solid #333; padding-bottom: 5px;">🛒 Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr style="background: #f8f9fa; text-align: left;">
                <th style="padding: 8px;">Product</th>
                <th style="padding: 8px;">Variant</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
            </tr>
            ${itemsHtml}
            <tr>
                <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">₹${totalAmount}</td>
            </tr>
        </table>

        <div style="margin-top: 30px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 10px;">
            <p>This is an automated notification for the Ralitee Admin Team.</p>
        </div>
    </div>
</body>
</html>
    `;
};

module.exports = { getOrderConfirmationEmailHtml, getAdminOrderEmailHtml };
