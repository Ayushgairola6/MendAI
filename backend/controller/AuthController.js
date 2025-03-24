import { pool } from "../Database.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const Register = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        if (!email || !firstname||!lastname || !password) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }
        // check if the user with same email exists
        const checkQuery = `SELECT * FROM users WHERE email = $1`;
        pool.query(checkQuery, [email], (err, result) => {
            if (err) {
                console.log(err)
                return res.status(409).json({ success: false, message: "This email already exists" });
          
            }
        })
        // hash the user password to make it secure
        const hashedPass = await bcrypt.hash(password, 10);
        //  if user is  new insert details
        const InsertQuery = `INSERT INTO users (name,email,password) VALUES ($1,$2,$3)`;
       const username = `${firstname}_${lastname}`
        pool.query(InsertQuery, [username, email, hashedPass], (err, result) => {
            if (err) {
                console.log(err,"Erroo while inserting user data");
                return res.status(400).json({ success: false, message: "Could not create an account please try again later" })
            }

            return res.status(200).json({ success: true, message: "Account created Successfully" });
        })


    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const Login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }

        // Get user from database
        const checkQuery = `SELECT * FROM users WHERE email = $1`;
        pool.query(checkQuery, [email], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "No user found" });
            }

            const user = result.rows[0];

            // Compare password (async)
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: "Error verifying password" });
                }

                if (!isMatch) {
                    return res.status(400).json({ success: false, message: "Invalid password" });
                }
                // assign the user a token for 2 days
                const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "3d" });
                // sending the token with cookie for secure data transaction
                res.cookie("auth_token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none", // Prevent CSRF attacks
                    maxAge: 2 * 24 * 60 * 60 * 1000, // 2 days
                });
                return res.status(200).json({ success: true, message: "Logged in successfully" });
            });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const LoginStateUpdate =(req,res)=>{
    try{
      const user = req.user;
      if(user){
        return res.status(200).json({success:true,message:"authorized"});

      }else{
        return res.status(400).json({success:true,message:"unauthorized"});

      }
    }catch(error){
        console.log("error",error);
    }
}