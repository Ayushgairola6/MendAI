import { pool } from "../Database.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import "./googleOauthConfig.js";
import { Redisclient } from "../caching/RedisConfig.js";
// import nodemailer from 'nodemailer'
import { Resend } from 'resend';
import dotenv from 'dotenv';
dotenv.config();

// email sending config via resend

// const resend = new Resend(process.env.RESEND_API_KEY);



export const googleAuth = async (req, res) => {
    try {
        // extracting the user data provided by google
        const { googleId, name, email, avatar } = req.user.user;




        // if redis does not have it check in the database
        const query = `SELECT * FROM users WHERE email = $1`;
        const data = await pool.query(query, [email.toLowerCase()]);

        // if user exists and used manual email password method
        if (data.rows.length > 0) {
            const user = data.rows[0]

            // if user signed up manually
            if (!user.google_id || user.google_id == null) {
                return res.redirect("http://localhost:5173/oauth-success")
            }
            // if user previously ever signed up with their google account we can give them access 
            if (data.rows[0].google_id) {
                const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "4d" });
                // append the token with the cookies of
                res.cookie("auth_token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 4 * 24 * 60 * 60 * 1000,
                });

                // sending verification email
            //     resend.emails.send({
            //         from: `VIORA (MendAI) <ayushgairola2002@gmail.com>`,
            //         to: email,
            //         subject: "Welcome to MendAI",
            //         // plain‑text body
            //         html: `
            //     <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 40px;">
            //         <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
            //             <div style="background: #4f8cff; color: #fff; padding: 24px 32px;">
            //                 <h2 style="margin: 0;">Welcome back MendAI!</h2>
            //             </div>
            //             <div style="padding: 32px;">
            //                 <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
            //                     Hi <b>${name}</b>,
            //                 </p>
            //                 <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
            //                     Thanks for choosing <b>MendAI</b> as your friend. Please enjoy your time and don't be scared to express yourself, because Alice is your friend in need.
            //                 </p>
            //                 <div style="text-align: center; margin: 32px 0;">
            //                     <img src="https://mendai.netlify.app/logo192.png" alt="MendAI Logo" style="width: 80px; border-radius: 50%;" />
            //                 </div>
            //                 <p style="font-size: 15px; color: #888;">
            //                     If you have any questions, just reply to this email—we're always happy to help.
            //                 </p>
            //             </div>
            //             <div style="background: #f0f4f8; color: #888; text-align: center; padding: 16px 0; font-size: 13px;">
            //                 &copy; ${new Date().getFullYear()} MendAI. All rights reserved.
            //             </div>
            //         </div>
            //     </div>
            // `
            //     });

                return res.redirect(`https://mendai.netlify.app/oauth-success?token=${token}`);
            }
        }


        // if the user is signing up for the first time
        const newUser = await pool.query(
            "INSERT INTO users (email, google_id, name, image) VALUES ($1, $2, $3, $4) RETURNING *",
            [email.toLowerCase(), googleId, name, avatar]
        );

        // Generate JWT token
        const token = jwt.sign({ userId: newUser.rows[0].id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "4d" });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 4 * 24 * 60 * 60 * 1000,
        });
        // resend.emails.send({
        //     from: `VIORA (MendAI) <ayushgairola2002@gmail.com>`,
        //     to: email,
        //     subject: "Welcome to MendAI",
        //     // plain‑text body
        //     html: `
        //         <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 40px;">
        //             <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
        //                 <div style="background: #4f8cff; color: #fff; padding: 24px 32px;">
        //                     <h2 style="margin: 0;">Welcome to MendAI!</h2>
        //                 </div>
        //                 <div style="padding: 32px;">
        //                     <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
        //                         Hi <b>${name}</b>,
        //                     </p>
        //                     <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
        //                         Thanks for choosing <b>MendAI</b> as your friend. Please enjoy your time and don't be scared to express yourself, because Alice is your friend in need.
        //                     </p>
        //                     <div style="text-align: center; margin: 32px 0;">
        //                         <img src="https://mendai.netlify.app/logo192.png" alt="MendAI Logo" style="width: 80px; border-radius: 50%;" />
        //                     </div>
        //                     <p style="font-size: 15px; color: #888;">
        //                         If you have any questions, just reply to this email—we're always happy to help.
        //                     </p>
        //                 </div>
        //                 <div style="background: #f0f4f8; color: #888; text-align: center; padding: 16px 0; font-size: 13px;">
        //                     &copy; ${new Date().getFullYear()} MendAI. All rights reserved.
        //                 </div>
        //             </div>
        //         </div>
        //     `
        // });
        return res.redirect(`https://mendai.netlify.app/oauth-success?token=${token}`);

    } catch (error) {
        console.log(error)
        throw new Error("Error while connecting to your google account!")
    }
}


// seperate google auth controller for mobile apps
export const googleMobileAuth = async (req, res) => {
    try {
        // extracting the user data provided by google
        const { googleId, name, email, avatar } = req.user.user;

        const query = `SELECT * FROM users WHERE email = $1`;
        const data = await pool.query(query, [email]);

        // if user exists and used manual email password method
        if (data.rows.length > 0) {
            const user = data.rows[0];

            // if user signed up manually
            if (!user.google_id || user.google_id == null) {
                return res.redirect(`mendai://oauth-success?token=null`);
            }

            // if user previously ever signed up with their google account we can give them access 
            if (data.rows[0].google_id) {
                const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "4d" });
                res.cookie("auth_token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 4 * 24 * 60 * 60 * 1000,
                });
                return res.redirect(`https://mendai.netlify.app//oauth-success?token=${token}`);
            }
        }

        // if the user is signing up for the first time
        const newUser = await pool.query(
            "INSERT INTO users (email, google_id, name, image) VALUES ($1, $2, $3, $4) RETURNING *",
            [email, googleId, name, avatar]
        );
        const token = jwt.sign(
            { userId: newUser.rows[0].id, email: newUser.rows[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "4d" }
        );
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 4 * 24 * 60 * 60 * 1000,
        });
        return res.redirect(`mendai://oauth-success?token=${token}`);

    } catch (error) {
        console.log(error);
        throw new Error("Error while connecting to your google account!");
    }
};

// jwt based registration function
export const Register = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        if (!email || !firstname || !lastname || !password) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }
        // check if the user with same email exists
        const checkQuery = `SELECT * FROM users WHERE email = $1`;
        const existingUser = await pool.query(checkQuery, [email.toLowerCase()])

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "This user already exists" })
        }
        // hash the user password to make it secure
        const hashedPass = await bcrypt.hash(password, 10);
        //  if user is  new insert details
        const InsertQuery = `INSERT INTO users (name,email,password) VALUES ($1,$2,$3)`;
        const username = `${firstname}_${lastname}`
        pool.query(InsertQuery, [username, email.toLowerCase(), hashedPass], (err, result) => {
            if (err) {
                console.log(err, "Erroo while inserting user data");
                return res.status(400).json({ success: false, message: "Could not create an account please try again later" })
            }

        })

    //    await resend.emails.send({
    //         from: `VIORA (MendAI) <ayushgairola2002@gmail.com>`,
    //         to: [email],
    //         subject: " Welcome to MendAI"
    //         ,
    //         // plain‑text body
    //         html: `
    //             <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 40px;">
    //                 <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
    //                     <div style="background: #4f8cff; color: #fff; padding: 24px 32px;">
    //                         <h2 style="margin: 0;">Welcome to MendAI!</h2>
    //                     </div>
    //                     <div style="padding: 32px;">
    //                         <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
    //                             Hi <b>${firstname}_${lastname}</b>,
    //                         </p>
    //                         <p style="font-size: 16px; color: #555; margin-bottom: 24px;">
    //                             Thanks for choosing <b>MendAI</b> as your friend. Please enjoy your time and don't be scared to express yourself, because Alice is your friend in need.
    //                         </p>
    //                         <div style="text-align: center; margin: 32px 0;">
    //                             <img src="https://mendai.netlify.app/logo192.png" alt="MendAI Logo" style="width: 80px; border-radius: 50%;" />
    //                         </div>
    //                         <p style="font-size: 15px; color: #888;">
    //                             If you have any questions, just reply to this email—we're always happy to help.
    //                         </p>
    //                     </div>
    //                     <div style="background: #f0f4f8; color: #888; text-align: center; padding: 16px 0; font-size: 13px;">
    //                         &copy; ${new Date().getFullYear()} MendAI. All rights reserved.
    //                     </div>
    //                 </div>
    //             </div>
    //         `
    //     });

        return res.status(200).json({ success: true, message: "Account created Successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const Login = (req, res) => {
    try {
        console.log(req.body)

        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }
        // Get user from database
        const checkQuery = `SELECT * FROM users WHERE email = $1`;
        pool.query(checkQuery, [email.toLowerCase()], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            if (result.rows.length === 0) {
                return res.status(404).json({ success: false, message: "No user found" });
            } else if (result.rows.length > 0 && result.rows[0].google_id) {

                return res.status(400).json({ message: "You previously loggedIn using this account using google please use that method" }).redirect("https://mendai.netlify.app/oauth-sucess");
            }

            const user = result.rows[0];

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ success: false, message: "Error verifying password" });
                }

                if (!isMatch) {
                    return res.status(400).json({ success: false, message: "Invalid password" });
                }

                const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "4d" });
                // sending the token with cookie for secure data transaction
                res.cookie("auth_token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 4 * 24 * 60 * 60 * 1000,
                });
                return res.status(200).json({ success: true, message: "Logged in successfully", token });
            });
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const LoginStateUpdate = (req, res) => {
    try {
        const user = req.user;
        if (user) {
            return res.status(200).json({ success: true, message: "authorized" });

        } else {
            return res.status(400).json({ success: true, message: "unauthorized" });

        }
    } catch (error) {
        console.log("error", error);
    }
}


export const ResetPassword = async (req, res) => {
    try {
        const { email,
            PassWord,
            ConfirmedPassword } = req.body
        // console.log(req.body);
        if (!email || typeof email !== "string" || !PassWord || typeof PassWord !== "string" || !ConfirmedPassword || typeof ConfirmedPassword !== "string") {
            return res.status(400).json({ message: "Invalid data" })
        }


        const query = `SELECT email,password FROM users WHERE email = $1`;
        const userFound = await pool.query(query, [email.toLowerCase()]);
        // console.log(userFound.rows)
        if (userFound.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        if (userFound.rows[0].password === null || userFound.rows[0].password === "NULL") {
            return res.status(400).json({ message: "You cannot reset password for an account created using a google account" })
        }
        const isMatched = await bcrypt.compare(userFound.rows[0].password, PassWord);
        // console.log(isMatched)
        if (isMatched === true) {
            return res.status(400).json({ message: "Cannot use this password again" });
        }

        // sending the password confirmation email to the user
        // const info = await transporter.sendMail({
        //     from: `VIORA (MendAI) <ayushgairola2002@gmail.com>`,
        //     to: email,
        //     subject: "Password Reset Request (MendAI)",
        //     text: `Please click on this link below to go to the page to reset your password
        //      http://localhost:5173/ResetPassword/`, // plain‑text body
        //     html: "<b>Hello world?</b>", // HTML body
        // });


        return res.json({ message: "Reset Request has been approved" })

    } catch (error) {
        console.error(error);
    }
}