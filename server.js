const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.get("/", (req, res) => {
res.send("iPhone Dhamaka payment server is running");
});

app.post("/create-order", async (req, res) => {
try {
const order = await razorpay.orders.create({
amount: 29900,
currency: "INR",
receipt: "watch_" + Date.now()
});

```
res.json({
  orderId: order.id,
  amount: order.amount,
  currency: order.currency,
  keyId: process.env.RAZORPAY_KEY_ID
});
```

} catch (error) {
res.status(500).json({ error: "Order create nahi hua" });
}
});

app.post("/verify-payment", async (req, res) => {
try {
const { razorpay_order_id, razorpay_payment_id,
razorpay_signature } = req.body;

```
const expectedSignature = crypto
  .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
  .update(razorpay_order_id + "|" + razorpay_payment_id)
  .digest("hex");

if (!crypto.timingSafeEqual(
  Buffer.from(expectedSignature),
  Buffer.from(razorpay_signature || "")
)) {
  return res.status(400).json({ error: "Payment verification failed" });
}

const payment = await razorpay.payments.fetch(razorpay_payment_id);

if (
  payment.order_id !== razorpay_order_id ||
  payment.status !== "captured" ||
  payment.amount !== 29900 ||
  payment.currency !== "INR"
) {
  return res.status(400).json({ error: "Payment abhi confirm nahi hua" });
}

res.json({
  verified: true,
  message: "Payment verified. Coupon system abhi connect karna baki hai."
});
```

} catch (error) {
res.status(500).json({ error: "Payment verify nahi hua" });
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log("Server started on port " + PORT);
});

