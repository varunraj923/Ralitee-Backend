const { getOrderConfirmationEmailHtml } = require("./emailTemplates");
const fs = require("fs");
const path = require("path");

// Mock Data
const mockUser = {
    name: "Responsive Test User",
    email: "test@example.com"
};

const mockOrder = {
    _id: "MOBILE_TEST_123",
    createdAt: new Date(),
    totalAmount: 1250,
    shippingAddress: {
        fullName: "Mobile User",
        street: "123 Small Screen Way",
        city: "Tech City",
        state: "Karnataka",
        zip: "560100",
        country: "India",
        phone: "+91 9876543210"
    }
};

const mockOrderItems = [
    {
        product: {
            name: "Responsive T-Shirt",
            thumbnail: "https://via.placeholder.com/150",
            price: 500
        },
        quantity: 1,
        size: "L",
        color: "Black",
        price: 500
    },
    {
        product: {
            name: "Fluid Jeans",
            images: ["https://via.placeholder.com/150"],
            price: 750
        },
        quantity: 1,
        size: "34",
        color: "Blue",
        price: 750
    }
];

// Generate HTML
try {
    const html = getOrderConfirmationEmailHtml(mockOrder, mockUser, mockOrderItems);
    const outputPath = path.join(__dirname, "test_responsive_email.html");
    fs.writeFileSync(outputPath, html);
    console.log(`Responsive email template generated: ${outputPath}`);
} catch (error) {
    console.error("Error generating email:", error);
}
