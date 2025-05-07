const express = require("express");
const PaymentRouter = express.Router();
const { placeOrder } = require("../PaymentGateway/paymentController")

PaymentRouter.post("/payment/place-order",verif)
