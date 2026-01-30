import { db } from "../core/config/knex.js";

// Simpan token ke blacklist
export const addBlacklistToken = async (token, expiredAt) => {
  return db("blacklist_tokens").insert({ token, expired_at: expiredAt });
};

// Cek apakah token diblacklist
export const isTokenBlacklisted = async (token) => {
  const result = await db("blacklist_tokens").where({ token }).first();
  return !!result;
};
