const { getAdminOrderEmailHtml } = require("./emailTemplates");
const fs = require("fs");
const path = require("path");

// Mock Data (Same as before)
const mockUser = {
    name: "Jane Doe",
    email: "jane@example.com",
    _id: "USER987654321"
};

const mockOrder = {
    _id: "ORDER9988776655",
    createdAt: new Date(),
    totalAmount: 2500,
    shippingAddress: {
        fullName: "Jane Doe",
        street: "456 Park Avenue",
        city: "Delhi",
        state: "Delhi",
        zip: "110001",
        country: "India",
        phone: "+91 9988776655"
    }
};

const mockOrderItems = [
    {
        product: {
            name: "Summer Floral Dress",
            _id: "PROD112233"
        },
        quantity: 1,
        size: "L",
        color: "Red",
        price: 2500
    }
];

// Generate HTML
try {
    const html = getAdminOrderEmailHtml(mockOrder, mockUser, mockOrderItems);
    const outputPath = path.join(__dirname, "test_admin_email_output.html");
    fs.writeFileSync(outputPath, html);
    console.log(`Admin email template generated successfully at: ${outputPath}`);
} catch (error) {
    console.error("Error generating admin email template:", error);
}
