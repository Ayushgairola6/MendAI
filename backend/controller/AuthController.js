import { pool } from "../Database.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import "./googleOauthConfig.js";


export const googleAuth = async (req, res) => {
    try {
        // extracting the user data provided by google
        const { googleId, name, email, avatar } = req.user.user;
        // const email = req.user.user.email;
        // const avatar = photos[0].value;

        const query = `SELECT * FROM users WHERE email = $1`;
        const data = await pool.query(query, [email]);

        // if user exists and used manual email password method
        if (data.rows.length > 0) {
            const user = data.rows[0]

            // if user signed up manually
            if (!user.google_id || user.google_id == null) {
                return res.redirect("http://localhost:5173/login?error=manual-only")
            }
            // if user previously ever signed up with their google account we can give them access 
            if (data.rows[0].google_id) {
                console.log(data.rows)
                const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "4d" });
                // append the token with the cookies of
                res.cookie("auth_token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "none",
                    maxAge: 4 * 24 * 60 * 60 * 1000,
                });
            }
            return res.redirect(`http://localhost:5173/oauth-success`);;
        }


        // if the user is signing up for the first time
        const newUser = await pool.query(
            "INSERT INTO users (email, google_id, name, image) VALUES ($1, $2, $3, $4) RETURNING *",
            [email, googleId, name, avatar]
        );
        // Generate JWT token
        const token = jwt.sign({ userId: newUser.rows[0].id, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: "4d" });
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 4 * 24 * 60 * 60 * 1000,
        });
        return res.redirect("http://localhost:5173/oauth-success");

    } catch (error) {
        console.log(error)
        throw new Error("Error while connecting to your google account!")
    }
}



// jwt based registration function
export const Register = async (req, res) => {
    try {
        const { firstname, lastname, email, password } = req.body;
        if (!email || !firstname || !lastname || !password) {
            return res.status(400).json({ message: "All fields are mandatory" });
        }
        // check if the user with same email exists
        const checkQuery = `SELECT * FROM users WHERE email = $1`;
        pool.query(checkQuery, [email], (err, result) => {
            if (err) {
                console.log(err)
                return res.status(400).json({ success: false, message: "This email already exists" });

            }
        })
        // hash the user password to make it secure
        const hashedPass = await bcrypt.hash(password, 10);
        //  if user is  new insert details
        const InsertQuery = `INSERT INTO users (name,email,password) VALUES ($1,$2,$3)`;
        const username = `${firstname}_${lastname}`
        pool.query(InsertQuery, [username, email, hashedPass], (err, result) => {
            if (err) {
                console.log(err, "Erroo while inserting user data");
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
            } else if (result.rows.length > 0 && result.rows[0].google_id) {
              
             return res.status(400).json({message:"You previously loggedIn using this account using google please use that method"}).redirect("http://localhost:5173/oauth-sucess");
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
                return res.status(200).json({ success: true, message: "Logged in successfully" });
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