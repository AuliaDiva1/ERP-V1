import { status, datetime } from "../utils/general.js";

/**
 * Middleware untuk memeriksa role user
 * @param {Array} allowedRoles - Array role yang diizinkan
 */
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({
        status: status.TIDAK_ADA_TOKEN,
        message: "Role tidak ditemukan",
        datetime: datetime(),
      });
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        status: status.GAGAL,
        message: "Anda tidak memiliki akses untuk melakukan aksi ini",
        datetime: datetime(),
      });
    }

    next();
  };
};