import express from 'express';
import { Register ,Login,googleAuth} from '../controller/AuthController';
import passport from 'passport';
export const UserRouter = express.Router();

chatsRouter.post("/Register",Register)
.post("/Login",Login)
.get("/google/auth",passport.authenticate("google", { scope: ["profile", "email"] }))
.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    googleAuth
  );