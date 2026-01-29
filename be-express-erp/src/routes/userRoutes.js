import { Router } from "express";
import { fetchAllUsers, createNewUser } from "../controllers/userController.js";

const router = Router();

router.get("/", fetchAllUsers);
router.post("/create", createNewUser);

export default router;
