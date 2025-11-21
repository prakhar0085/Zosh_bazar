const Seller = require("../models/Seller.js");
const jwtProvider = require("../utils/jwtProvider.js");

const sellerAuthMiddleware = async (req, res, next) => {
  try {
    // Check if the Authorization header is present
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing or invalid" });
    }

    // Extract the JWT token from the Authorization header
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "JWT Token is missing" });
    }

    let email;
    try {
      email = jwtProvider.getEmailFromJwt(token);
    } catch (error) {
      // Silently handle invalid tokens for public routes
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Find the seller using the extracted email
    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res
        .status(404)
        .json({ message: "Seller not found with email " + email });
    }

    req.seller = seller;

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports = sellerAuthMiddleware;
