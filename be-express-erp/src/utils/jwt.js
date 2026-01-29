import { config } from "dotenv";
import { jwtVerify, SignJWT } from "jose";

config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const secretKey = new TextEncoder().encode(JWT_SECRET);

export const generateToken = async (payload) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS512" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secretKey);
};

export const verifyToken = async (token) => {
  const { payload } = await jwtVerify(token, secretKey, {
    algorithms: ["HS512"],
  });

  return payload;
};
