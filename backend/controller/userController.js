import { pool } from "../Database.js";
import multer from 'multer';
import { uploadToFirebase } from "../firebaseConfig/firebaseController.js";
export const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1024 * 1024 * 20 } })

export const GetAccountData = (req, res) => {
    try {
        const UserId = req.user.userId;

        if (!UserId) {
            return res.status(400).json({ success: true, message: "No session Id found" });
        }

        const query = `SELECT id,email,dob,image,name FROM users WHERE id = $1`;
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

       const ImageUrl = await uploadToFirebase(Image,"MendAI/");
       const query = `UPDATE users SET image = $1 WHERE id = $2;
`;
       const response = await pool.query(query ,[ImageUrl,UserId]);

       if(response.rowCount===0){
        return res.status(400).json({message:"Unable to update your profile!"})
       }

        return res.status(200).json({message:"Successfully uploaded your image"});
    } catch (error) {
        throw error;
    }
}