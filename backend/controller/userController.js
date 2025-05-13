import { pool } from "../Database.js";
import multer from 'multer';
import { uploadToFirebase } from "../firebaseConfig/firebaseController.js";
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 20 } })
import { Redisclient } from "../caching/RedisConfig.js";

export const GetAccountData = async (req, res) => {
    try {
        const UserId = req.user.userId;

        if (!UserId) {
            return res.status(400).json({ success: true, message: "No session Id found" });
        }
        const redisKey = `user-${UserId}:info`
        let userData = await Redisclient.get(redisKey);

        if (userData) {
            userData = JSON.parse(userData);
            // console.log(userData);
            return res.status(200).json({ success: true, info: userData, message: "authorized" })
        }

        const query = `SELECT id,email,dob,image,name FROM users WHERE id = $1`;
        const user = await pool.query(query, [UserId]);
        if (user.rows.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await Redisclient.set(redisKey, JSON.stringify(user.rows[0]), 'EX', 60 * 10);
        return res.status(200).json({ success: true, info: user.rows[0], message: "authorized" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const uploadUserImages = async (req, res) => {
    try {
        const Image = req.file;
        if (!Image) return res.status(400).json({ message: "Image not found!" });
        const UserId = req.user.userId;
        if (!UserId) {
            return res.status(400).json({ success: true, message: "No session Id found" });
        }

        const ImageUrl = await uploadToFirebase(Image, "MendAI/");
        const query = `UPDATE users SET image = $1 WHERE id = $2;
`;
        const response = await pool.query(query, [ImageUrl, UserId]);

        if (response.rowCount === 0) {
            return res.status(400).json({ message: "Unable to update your profile!" })
        }

        return res.status(200).json({ message: "Successfully uploaded your image" });
    } catch (error) {
        throw error;
    }
}