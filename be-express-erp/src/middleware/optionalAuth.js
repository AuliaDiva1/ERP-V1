import jwt from "jsonwebtoken";

/**
 * Middleware untuk autentikasi opsional
 * Jika ada token, verify dan attach ke req.user
 * Jika tidak ada token, lanjutkan tanpa req.user
 */
export const optionalAuth = (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (token) {
      // Jika ada token, verify
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }

    // Lanjutkan ke controller (dengan atau tanpa req.user)
    next();
  } catch (error) {
    // Jika token invalid, tetap lanjutkan tanpa req.user
    // Biarkan controller yang menentukan apakah perlu token atau tidak
    next();
  }
};