// to protect routes that require authentication
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const protect = (req, res, next) => {
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

export default protect;
