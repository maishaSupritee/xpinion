// to protect routes that require authentication
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { handleResponse } from "../utils/helpers.js";
dotenv.config(); // Load environment variables from .env file

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization; // Get the authorization header from the request
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1]; // Extract the token from the header
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret
      req.user = decoded; // Attach the decoded user information to the request object
      next(); // Call the next middleware or route handler
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  } else {
    return res.status(401).json({ message: "No token provided" }); // If no token is provided, respond with an error
  }
};

export const requireAdmin = (req, res, next) => {
  //check whether user is authenticated
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  //check whether user is admin
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next(); //user is authenticated and is admin, proceed to next middleware or route handler
};

export const requireOwnerOrAdmin = (req, res, next) => {
  const targetUserId = req.params.id;
  const authenticatedUserId = req.user.id;
  const userRole = req.user.role;

  console.log("requireOwnerOrAdmin middleware:");
  console.log("- Target user ID:", targetUserId);
  console.log("- Authenticated user ID:", authenticatedUserId);
  console.log("- User role:", userRole);

  const isOwner = parseInt(targetUserId) === parseInt(authenticatedUserId);
  const isAdmin = userRole === "admin";

  if (isAdmin || isOwner) {
    console.log("Access granted:", isAdmin ? "admin" : "owner");
    return next();
  }

  console.log("Access denied");
  return res.status(403).json({
    message:
      "You can only access your own resources or you need admin privileges",
  });
};

export const requireAuth = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if(!token){
    return handleResponse(res, 401, "Unauthenticated");
  }

  try{
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  }catch(err){
    return handleResponse(res, 401, "Invalid or expired session");
  }
};
