import express from "express";
import { signUp, logIn } from "../controllers/authController.js";
import validateUserInput from "../middlewares/inputValidator.js";

const router = express.Router();

router.post("/signup", validateUserInput, signUp);
router.post("/login", logIn);

export default router;
