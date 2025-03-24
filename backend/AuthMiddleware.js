import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const verifyToken = (req, res, next) => {
    try {
        const token = req.cookies["auth_token"];
        
        if (!token) return res.status(400).json({ message: "No session token found" });
        const verified = jwt.verify(token, process.env.JWT_SECRET, (err, result) => {
            if (err) {
                console.log("error while verifying user token");
                return;
            }
            req.user = result;
        })
        next();
    } catch (error) {
        console.log(error);
    }
}