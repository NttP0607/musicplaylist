import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUser,
  deleteUser,
  logoutUser
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", verifyToken, getUserProfile);
router.put("/update/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);
router.post("/logout", verifyToken, logoutUser);

export default router;
