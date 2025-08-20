import bcrypt from "bcrypt";
import {
  getUserByEmailForAuthService,
  getUserByEmailService,
  createUserService,
} from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import { handleResponse } from "../utils/helpers.js";

//SIGN UP
export const signUp = async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;

    const existingUser = await getUserByEmailService(email);
    if (existingUser) {
      return handleResponse(res, 400, "User already exists with this email");
    }

    const newUser = await createUserService(username, email, password, role);
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

    // Use AUTH version that includes password
    const user = await getUserByEmailForAuthService(email);
    if (!user) {
      return handleResponse(res, 404, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return handleResponse(res, 401, "Invalid credentials");
    }

    const token = generateToken(user);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return handleResponse(res, 200, "Login successful", {
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    next(error);
  }
};
