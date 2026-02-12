const { getOrderConfirmationEmailHtml } = require("./emailTemplates");
const fs = require("fs");
const path = require("path");

// Mock Data
const mockUser = {
    name: "John Doe",
    email: "john@example.com"
};

const mockOrder = {
    _id: "ORDER123456789",
    createdAt: new Date(),
    totalAmount: 1499,
    shippingAddress: {
        fullName: "John Doe",
        street: "123 Main St, Apt 4B",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400001",
        country: "India",
        phone: "+91 9876543210"
    }
};

const mockOrderItems = [
    {
        product: {
            name: "Classic White T-Shirt",
            thumbnail: "https://via.placeholder.com/150",
            price: 499
        },
        quantity: 2,
        size: "M",
        color: "White",
        price: 499
    },
    {
        product: {
            name: "Blue Denim Jeans",
            images: ["https://via.placeholder.com/150"],
            price: 999
        },
        quantity: 1,
        size: "32",
        color: "Blue",
        price: 999
    } // Note: Total calc in template is just display, logic is correct
];

// Generate HTML
try {
    const html = getOrderConfirmationEmailHtml(mockOrder, mockUser, mockOrderItems);
    const outputPath = path.join(__dirname, "test_email_output.html");
    fs.writeFileSync(outputPath, html);
    console.log(`Email template generated successfully at: ${outputPath}`);
} catch (error) {
    console.error("Error generating email template:", error);
}
