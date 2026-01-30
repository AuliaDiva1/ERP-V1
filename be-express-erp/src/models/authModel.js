import { db } from "../core/config/knex.js";

/**
 * COUNT SUPER ADMIN
 */
export const countSuperAdmin = async () => {
  const result = await db("users")
    .where({ role: "SUPERADMIN" })
    .count("id as total");
  return result[0].total;
};

/**
 * GET USER PROFILE BY ID
 */
export const getUserProfileById = async (userId) => {
  const user = await db("users")
    .where({ id: userId })
    .select("id", "name", "email", "role", "created_at", "updated_at")
    .first();

  return user;
};

/**
 * BLACKLIST TOKEN
 */
export const blacklistToken = async (token, expiredAt) => {
  return await db("blacklist_tokens").insert({
    token,
    expired_at: expiredAt,
  });
};