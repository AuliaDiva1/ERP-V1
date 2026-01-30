import { db } from "../core/config/knex.js";

// Tambah history login/logout
export const addLoginHistory = async ({ userId, action, ip, userAgent }) => {
  const [id] = await db("login_history").insert({
    user_id: userId,
    action,
    ip_address: ip,
    user_agent: userAgent,
  });

  return id; // return id dari row yg baru dibuat
};

// Ambil riwayat login user
export const getLoginHistoryByUser = async (userId) => {
  return db("login_history").where({ user_id: userId }).orderBy("created_at", "desc");
};
