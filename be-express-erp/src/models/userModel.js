import { db } from "../core/config/knex.js";

// Ambil semua user
export const getAllUsers = async () => db("users").select("*");

// Ambil user berdasarkan ID
export const getUserById = async (id) => db("users").where({ id }).first();

// Ambil user berdasarkan email
export const getUserByEmail = async (email) =>
  db("users").where({ email }).first();

// Tambah user baru
export const addUser = async ({ name, email, password, role }) => {
  const [id] = await db("users").insert({ name, email, password, role });
  return db("users").where({ id }).first();
};

// Update user
export const updateUser = async (id, data) =>
  db("users").where({ id }).update(data).returning("*");

// Hapus user
export const deleteUser = async (id) =>
  db("users").where({ id }).del();

// ✅ Ambil user berdasarkan role
export const getUsersByRole = async (role) =>
  db("users").where({ role }).select("*");
