import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { pool } from './Database.js';
import multer from 'multer';
import { server, app } from "./controller/chatController.js";
import { Register, Login, LoginStateUpdate, googleAuth, googleMobileAuth, } from './controller/AuthController.js';
import { getChatHistory } from './controller/chatController.js';
import { verifyToken } from './AuthMiddleware.js';
import { GetAccountData, uploadUserImages, upload } from './controller/userController.js';
import { createGoogleStrategy } from './controller/googleOauthConfig.js'
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from 'passport';
import { placeOrder, verifyPayment } from './PaymentGateway/paymentController.js';

const Router = express.Router()
dotenv.config();
//cors configured to give frontend access to send cookies safely
app.use(cors({
	origin: ["http://localhost:5173", "https://mendai.netlify.app", "http://192.168.42.208:19006"], credentials: true,
}));
app.use(express.json())
app.use(cookieParser());

// Routes to access the api
Router.post("/api/Register", Register)
	.post("/api/Login", Login)
	.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"], prompt: "consent", }))
	.get(
		"/api/auth/google/callback",
		passport.authenticate("google", {
			session: false,
			failureRedirect: "/login",
			failureMessage: true,
		}),
		googleAuth
	)
Router.get("/api/mobile/auth/google", (req, res, next) => {
	passport.use("google-mobile", createGoogleStrategy("https://mendai.onrender.com/api/mobile/auth/google/callback"));

	passport.authenticate("google-mobile", {
		scope: ["profile", "email"],
		prompt: "consent"
	})(req, res, next);
})

	.get("/api/mobile/auth/google/callback",
		passport.authenticate("google-mobile", {
			session: false,
			failureRedirect: "/login"
		}),
		googleMobileAuth
	)
	.get("/api/verify/account", verifyToken, LoginStateUpdate)
	.get("/api/account/data", verifyToken, GetAccountData)
	.post("/api/update/profile", verifyToken, upload.single("image"), uploadUserImages)
	.get("/api/chat/history/data", verifyToken, getChatHistory)
	.post("/payment/place-order", verifyToken, placeOrder)
	.post("/payment/clearance", verifyToken, verifyPayment)

app.use(Router);

server.listen(process.env.PORT, "0.0.0.0", () => {
	console.log("server is running on port 8080 , with socket connection on it too")
})
