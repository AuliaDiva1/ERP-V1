import bcrypt from "bcrypt";

const SALT = 10;

export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT);
};

export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};
