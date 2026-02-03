import axios from "axios";

// Ambil URL dari environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8100/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// GET ALL USERS
export const getUsers = async (token) => {
  try {
    const res = await axiosInstance.get("/users", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.users || [];
  } catch (err) {
    throw new Error(err.response?.data?.message || "Gagal mengambil data users");
  }
};

// GET USER BY ID
export const getUserById = async (token, id) => {
  try {
    const res = await axiosInstance.get(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.user;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Gagal mengambil data user");
  }
};

// CREATE USER
export const createUser = async (token, userData) => {
  try {
    const res = await axiosInstance.post("/users", userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Gagal membuat user");
  }
};

// UPDATE USER
export const updateUser = async (token, id, userData) => {
  try {
    const res = await axiosInstance.put(`/users/${id}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Gagal mengupdate user");
  }
};

// DELETE USER
export const deleteUser = async (token, id) => {
  try {
    const res = await axiosInstance.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Gagal menghapus user");
  }
};

// GET USERS BY ROLE
export const getUsersByRole = async (token, role) => {
  try {
    const res = await axiosInstance.get(`/users?role=${role}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.users || [];
  } catch (err) {
    throw new Error(err.response?.data?.message || "Gagal mengambil data users by role");
  }
};