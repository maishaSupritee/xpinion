// standard response function
import {
  createUserService,
  getAllUsersService,
  getUserByIdService,
  getUserByEmailService,
  updateUserService,
  deleteUserService,
} from "../models/userModel.js";

import { handleResponse } from "../utils/responseHandler.js";

export const createUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  try {
    const newUser = await createUserService(username, email, password);
    handleResponse(res, 201, "User created successfully", newUser);
  } catch (error) {
    next(error); // Pass the error to the centralized error handling middleware i.e. errorHandling function from errorHandler.js
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await getAllUsersService();
    handleResponse(res, 200, "Users fetched successfully", users);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await getUserByIdService(req.params.id);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }
    handleResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const getUserByEmail = async (req, res, next) => {
  const { email } = req.params;
  try {
    const user = await getUserByEmailService(email);
    if (!user) {
      return handleResponse(res, 404, "User not found");
    }
    handleResponse(res, 200, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  const targetUserId = req.params.id;
  const authenticatedUserId = req.user.id;
  try {
    const targetUser = await getUserByIdService(targetUserId);
    if (!targetUser) {
      return handleResponse(res, 404, "User not found");
    }
    console.log("Comparing user IDs:", targetUser.id, authenticatedUserId);
    if (parseInt(targetUser.id) !== parseInt(authenticatedUserId)) {
      return handleResponse(
        res,
        403,
        "You are not authorized to update this user"
      );
    }

    const updatedUser = await updateUserService(
      targetUserId,
      username,
      email,
      password
    );
    handleResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const targetUserId = req.params.id;
  const authenticatedUserId = req.user.id;
  console.log("Request to delete user with ID:", targetUserId);
  try {
    const targetUser = await getUserByIdService(targetUserId);
    if (!targetUser) {
      return handleResponse(res, 404, "User not found");
    }

    if (parseInt(targetUser.id) !== parseInt(authenticatedUserId)) {
      return handleResponse(
        res,
        403,
        "You are not authorized to delete this user"
      );
    }

    console.log("Deleting user with ID:", targetUserId);

    const deletedUser = await deleteUserService(targetUserId);
    handleResponse(res, 204, "User deleted successfully", deletedUser);
  } catch (error) {
    next(error);
  }
};
