import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { validateUserInput } from "../middlewares/inputValidator.js";
import protect from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/users", validateUserInput, createUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

// Protected routes
router.put("/users/:id", protect, validateUserInput, updateUser);
router.delete("/users/:id", protect, deleteUser);

export default router;
