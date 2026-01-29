import { getAllUsers, getUserByEmail, addUser } from "../models/userModel.js";
import { registerSchema } from "../schemas/authSchema.js";
import { datetime, status } from "../utils/general.js";
import { hashPassword } from "../utils/hash.js";

export const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();

    if (users.length === 0) {
      res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data User kosong",
        datetime: datetime(),
      });
    }

    res.status(200).json({
      status: status.SUKSES,
      message: "Data User berhasil di dapatkan",
      datetime: datetime(),
      users,
    });
  } catch (error) {
    res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

export const createNewUser = async (req, res) => {
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

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await addUser({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data user berhasil ditambahkan",
      datetime: datetime(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};
