require("dotenv").config();
const express = require("express");
const connectDB = require("./db/connection.js");
const authRouter = require("./routes/auth.js");
const productRouter = require("./routes/product.js");
const categoryRouter = require("./routes/category.js");
const adminRouter = require("./routes/admin.js");
const uploadRouter = require("./routes/upload");
const homepageRouter = require("./routes/homepage");

const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// middlewares
app.use(express.json());
app.use(cookieParser());

// routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/admin", adminRouter);
app.use("/api/homepage", homepageRouter);

app.use("/api/upload", uploadRouter);
app.use("/api/cart", require("./routes/cart.js"));
app.use("/api/orders", require("./routes/order.js"));
app.use("/api/user", require("./routes/user.js"));

// health check (optional but recommended)
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Ralitee API running" });
});

// db + server
connectDB()
  .then(() => {
    console.log("DB connected successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });
