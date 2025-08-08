import express from "express";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { validateUserInput } from "../middlewares/inputValidator.js";

const router = express.Router();

router.post("/users", validateUserInput, createUser);
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", validateUserInput, updateUser);
router.delete("/user/:id", deleteUser);

export default router;
