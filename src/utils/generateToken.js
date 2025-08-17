import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRATION || "1h", // Default expiration time is 1 hour
    }
  );
}; // Function to generate a JWT token for a user

export default generateToken;
