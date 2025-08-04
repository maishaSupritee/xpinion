import bcrypt from "bcrypt";
import {
  getUserByEmailService,
  createUserService,
} from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { handleResponse } from "./userController.js";

//SIGN UP
export const signUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await getUserByEmailService(email);
    if (existingUser) {
      return handleResponse(res, 400, "User already exists with this email");
    }

    const newUser = await createUserService(name, email, password);
    const token = generateToken(newUser.id);

    return handleResponse(res, 201, "User created successfully", {
      user: newUser,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// LOG IN
export const logIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await getUserByEmailService(email);
    if (!user) {
      return handleResponse(res, 404, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleResponse(res, 401, "Invalid credentials");
    }

    const token = generateToken(user.id);
    return handleResponse(res, 200, "Login successful", { user, token });
  } catch (error) {
    next(error);
  }
};
