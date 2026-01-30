import { 
  getAllUsers, 
  getUserByEmail, 
  addUser, 
  getUserById, 
  updateUser, 
  deleteUser, 
  getUsersByRole 
} from "../models/userModel.js";
import { registerSchema } from "../schemas/authSchema.js";
import { datetime, status } from "../utils/general.js";
import { hashPassword } from "../utils/hash.js";
import { countSuperAdmin } from "../models/authModel.js";

// =======================
// Fetch all users
// =======================
export const fetchAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    let users;

    if (role) {
      users = await getUsersByRole(role); 
    } else {
      users = await getAllUsers();
    }

    if (!users || users.length === 0) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "Data User kosong",
        datetime: datetime(),
      });
    }

    // Hilangkan password dari response
    const sanitizedUsers = users.map(({ password, ...user }) => user);

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data User berhasil didapatkan",
      datetime: datetime(),
      users: sanitizedUsers,
    });
  } catch (error) {
    console.error("Error fetchAllUsers:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Get user by ID
// =======================
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    // Sembunyikan password
    const { password, ...userWithoutPassword } = user;

    return res.status(200).json({
      status: status.SUKSES,
      message: "Data user berhasil didapatkan",
      datetime: datetime(),
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error getUserByIdController:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Create new user
// =======================
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

    // Cek batasan Super Admin (maksimal 3)
    if (role === "SUPERADMIN") {
      const total = await countSuperAdmin();

      if (total >= 3) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: "Maksimal 3 Super Admin sudah terdaftar",
          datetime: datetime(),
        });
      }
    }

    // Cek email sudah ada
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Email sudah terdaftar",
        datetime: datetime(),
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tambah user
    const user = await addUser({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      status: status.SUKSES,
      message: "User berhasil ditambahkan",
      datetime: datetime(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error createNewUser:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Update user
// =======================
export const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Cek apakah user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    // Jika mengubah role menjadi SUPERADMIN, cek batasan
    if (data.role === "SUPERADMIN" && existingUser.role !== "SUPERADMIN") {
      const total = await countSuperAdmin();
      
      if (total >= 3) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: "Maksimal 3 Super Admin sudah terdaftar",
          datetime: datetime(),
        });
      }
    }

    // Jika email diubah, cek apakah sudah digunakan user lain
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await getUserByEmail(data.email);
      if (emailExists) {
        return res.status(400).json({
          status: status.BAD_REQUEST,
          message: "Email sudah digunakan oleh user lain",
          datetime: datetime(),
        });
      }
    }

    // Hash password jika ada
    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    // Update data user
    await updateUser(id, data);

    // Ambil kembali data user yang sudah diupdate
    const updatedUser = await getUserById(id);
    
    // Hilangkan password dari response
    const { password, ...userWithoutPassword } = updatedUser;

    return res.status(200).json({
      status: status.SUKSES,
      message: "User berhasil diupdate",
      datetime: datetime(),
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updateUserController:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};

// =======================
// Delete user
// =======================
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah user exists
    const existingUser = await getUserById(id);
    if (!existingUser) {
      return res.status(404).json({
        status: status.NOT_FOUND,
        message: "User tidak ditemukan",
        datetime: datetime(),
      });
    }

    // Proteksi: Jangan hapus diri sendiri
    if (req.user?.userId === parseInt(id)) {
      return res.status(400).json({
        status: status.BAD_REQUEST,
        message: "Anda tidak dapat menghapus akun sendiri",
        datetime: datetime(),
      });
    }

    await deleteUser(id);

    return res.status(200).json({
      status: status.SUKSES,
      message: "User berhasil dihapus",
      datetime: datetime(),
    });
  } catch (error) {
    console.error("Error deleteUserController:", error);
    return res.status(500).json({
      status: status.GAGAL,
      message: `Terjadi kesalahan pada server: ${error.message}`,
      datetime: datetime(),
    });
  }
};