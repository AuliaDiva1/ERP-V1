import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode(process.env.SECRET_KEY);

export const validateTimestamp = (req, res, next) => {
  try {
    const timestamp = req.headers["x-timestamp"];

    if (!timestamp) {
      return res.status(400).json({
        message: "Missing signature or timetstamp header",
      });
    }

    const requestTimestamp = parseInt(timestamp, 10);
    if (isNaN(requestTimestamp)) {
      return res.status(500).json({ message: "Invalid X-Timestamp value" });
    }

    const currentTimestamp = Date.now();
    const timeDifference = Math.abs(currentTimestamp - requestTimestamp);
    const limitTime = 5 * 60 * 1000;

    if (timeDifference > limitTime) {
      return res.status(408).json({ message: "Request timestamp expired" });
    }

    next();
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const validateSignature = async (req, res, next) => {
  try {
    const timestamp = req.headers["x-timestamp"];
    const signature = req.headers["x-signature"];
    const token = req.cookies?.token || "";
    const endpoint = req.originalUrl;

    if (!timestamp || !signature) {
      return res.status(400).json({
        message: "Missing signature or timetstamp header",
      });
    }

    const { payload } = await jwtVerify(signature, secretKey, {
      algorithms: ["HS512"],
    });

    const expectedPayload = `${timestamp}.${token}.${endpoint}`;
    if (payload.payload !== expectedPayload) {
      return res.status(403).json({ message: "Invalid signature" });
    }

    next();
  } catch (err) {
    console.error("Signature verification failed:", err);
    res.status(401).json({ message: "Unauthorized" });
  }
};
