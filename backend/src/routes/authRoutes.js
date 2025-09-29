import express from "express";
import { signUp, logIn, logOut, getCurrentUser } from "../controllers/authController.js";
import { validateUserInput } from "../middlewares/inputValidator.js";
import { requireAuth } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/signup", validateUserInput, signUp);
router.post("/login", logIn);
router.post("/logout", requireAuth, logOut);
router.get("/me", requireAuth, getCurrentUser);

export default router;
