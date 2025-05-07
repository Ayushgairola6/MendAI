import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { pool } from '../Database.js';
dotenv.config();

export const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY_ID,
    key_secret: process.env.RAZORPAY_TEST_SECRET,
});

// this function places and order
export const placeOrder = async (req, res) => {
    try {
        const { validity, amount, currency } = req.body;
        if (!validity || !amount || !currency) {
            return res.status(400).json({ message: "All Plan details are required" });
        }

        const options = {
            amount: amount * 100, // Razorpay expects amount in paise
            currency: currency,
            receipt: "receipt_order_" + Date.now(),
        };

        const order = await razorpayInstance.orders.create(options);
        console.log(order)
        return res.json(order);
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// function to  verify the signature and verify the users payment has not been tampered
export const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, validity } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: "No payement data found" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_TEST_SECRET)
        .update(sign.toString())
        .digest("hex");
    if (expectedSign === razorpay_signature) {
        // Save to DB or mark subscription active here
        const query = `
  INSERT INTO payments (user_id, plan_type, valid_from, valid_to,validity,amount_paid,currency,payment_id,order_id,status)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  RETURNING *;
`;
        const values = [
            req.user.id,//users id
            req.body.planType,//type of the plan
            new Date(), //day the subscription was made
            new Date(Date.now() + (req.body.validity * 24 * 60 * 60 * 1000)),//valid till
            new Date(Date.now() + (req.body.validity * 24 * 60 * 60 * 1000)), //validity 
            req.body.amount,//amount paid
            req.body.currency,//currency preferred
            req.body.razorpay_payment_id,//users payment id
            req.body.razorpay_order_id,// the subscription id
            "active" //status of the subscription
        ];

        const data = await pool.query(query, values)
        console.log(data);
        return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }
};
