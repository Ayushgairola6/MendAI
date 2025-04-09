import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) => {
   const cookieToken = req.cookies["auth_token"];
    const authHeader = req.headers.authorization;
    let token;

    // Prefer cookie token, fallback to Bearer token
    if (cookieToken) {
        token = cookieToken;
    } else if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }
}