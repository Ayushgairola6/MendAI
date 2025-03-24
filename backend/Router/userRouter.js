import express from 'express';
import { Register ,Login} from '../controller/AuthController';
export const UserRouter = express.Router();

chatsRouter.post("/Register",Register)
.post("Login",Login)