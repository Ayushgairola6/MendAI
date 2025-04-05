import { pool } from "../Database.js";
import multer from 'multer';

export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 20 } })

export const GetAccountData = (req, res) => {
    try {
        const UserId = req.user.userId;

        if (!UserId) {
            return res.status(400).json({ success: true, message: "No session Id found" });
        }

        const query = `SELECT * FROM users WHERE id = $1`;
        pool.query(query, [UserId], (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: "Internal server error! " })
            }
            if (result.rows.length > 0) {
                console.log(result.rows);
                return res.status(200).json({ success: true, info: result.rows[0] ,message:"authorized"});
            } else {
                return res.status(404).json({ success: true, message: "User not found!" });
            }
        })


    } catch (error) {
        console.log(error);
    }
}

export const uploadUserImages = async (req, res) => {
    try {
        const Image = req.file;
        console.log(req.file)
        if (!Image) return res.status(400).json({ message: "Image not found!" });
        const UserId = req.user.userId;
        if (!UserId) {
            return res.status(400).json({ success: true, message: "No session Id found" });
        }

        console.log(req.user,"ki Image",Image);
        return res.status(200).json({message:"Uploaded"});
    } catch (error) {
        throw error;
    }
}