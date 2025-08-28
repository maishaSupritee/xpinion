import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { validateUserInput } from "../middlewares/inputValidator.js";
import {
  protect,
  requireOwnerOrAdmin,
  requireAdmin,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/users", validateUserInput, createUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);

// Protected writes
router.put(
  "/users/:id",
  protect,
  requireOwnerOrAdmin,
  validateUserInput,
  updateUser
);
router.delete("/users/:id", protect, requireOwnerOrAdmin, deleteUser);

// Admin routes
router.post(
  "/users/admin",
  protect,
  requireAdmin,
  validateUserInput,
  createUser
);

export default router;
