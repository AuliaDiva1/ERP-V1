import { getUserByEmail, addUser } from "../models/userModel.js";
import { addLoginHistory } from "../models/loginHistoryModel.js";
import {
  countSuperAdmin,
  getUserProfileById,
  blacklistToken,
} from "../models/authModel.js";
import { registerSchema, loginSchema } from "../schemas/authSchema.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import { datetime, status } from "../utils/general.js";

/**
 * REGISTER
 */
export const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { name, email, password, role } = validation.data;

    // Cek jumlah SUPERADMIN yang ada
    const totalSuperAdmin = await countSuperAdmin();

    // Jika sudah ada SUPERADMIN, cek apakah request ini dari SUPERADMIN
    if (totalSuperAdmin > 0) {
      // Cek apakah ada token dan role SUPERADMIN
      const token = req.headers["authorization"]?.split(" ")[1];
      
      if (!token || !req.user || req.user.role !== "SUPERADMIN") {
        return res.status(403).json({
          status: status.GAGAL,
          message: "Hanya SUPERADMIN yang dapat mendaftarkan user baru",
          datetime: datetime(),
        });
      }
    }

    // Cek batasan Super Admin (maksimal 3)
    if (role === "SUPERADMIN" && totalSuperAdmin >= 3) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Maksimal 3 Super Admin sudah terdaftar.",
        datetime: datetime(),
      });
    }

    // Cek email sudah terdaftar atau belum
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Hash password dan simpan user
    const hashedPassword = await hashPassword(password);
    const user = await addUser({ 
      name, 
      email, 
      password: hashedPassword, 
      role 
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "User berhasil didaftarkan",
      datetime: datetime(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error register:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * LOGIN
 */
export const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Validasi gagal",
        datetime: datetime(),
        errors: validation.error.errors.map((err) => ({
          field: err.path[0],
          message: err.message,
        })),
      });
    }

    const { email, password } = validation.data;
    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    const isPasswordTrue = await comparePassword(password, existingUser.password);
    if (!isPasswordTrue) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email atau password salah",
        datetime: datetime(),
      });
    }

    const token = await generateToken({
      userId: existingUser.id,
      role: existingUser.role,
    });

    // Simpan history login
    await addLoginHistory({
      userId: existingUser.id,
      action: "LOGIN",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Login berhasil",
      datetime: datetime(),
      token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
      },
    });
  } catch (error) {
    console.error("Error login:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * GET PROFILE
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        status: status.TIDAK_ADA_TOKEN,
        message: "Token tidak valid atau tidak ditemukan",
        datetime: datetime(),
      });
    }

    const user = await getUserProfileById(userId);

    if (!user) {
      return res.status(404).json({
        status: status.GAGAL,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    return res.status(200).json({
      status: status.SUKSES,
      message: "Berhasil mengambil profil user",
      datetime: datetime(),
      user,
    });
  } catch (error) {
    console.error("Error getProfile:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

/**
 * LOGOUT
 */
export const logout = async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    const userId = req.user?.userId;

    if (!token || !userId) {
      return res.status(401).json({
        status: status.TIDAK_ADA_TOKEN,
        message: "Token tidak valid atau tidak ditemukan",
        datetime: datetime(),
      });
    }

    // Blacklist token
    await blacklistToken(token, new Date(req.user.exp * 1000));

    // Simpan history logout
    await addLoginHistory({
      userId,
      action: "LOGOUT",
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Logout berhasil, token sudah tidak berlaku",
      datetime: datetime(),
    });
  } catch (error) {
    console.error("Error logout:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan server: ${error.message}`,
      datetime: datetime(),
    });
  }
};