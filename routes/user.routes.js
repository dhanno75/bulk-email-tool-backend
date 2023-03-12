import express from "express";
import { client } from "../index.js";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  emails,
  getAllUsers,
  protect,
  auth,
} from "../services/user.services.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;
  console.log(data);
  const users = await client
    .db("emailtool")
    .collection("users")
    .insertMany(data);

  res.status(200).json({
    status: "success",
    data: users,
  });
});

// router.get("/allUsers", allUsers);
router.get("/allUsers", protect, async (req, res) => {
  const users = await getAllUsers();

  res.status(200).json({
    status: "success",
    data: users,
  });
});

router.post("/signup", signup);

router.post("/login", login);

router.post("/forgotPassword", forgotPassword);

router.put("/resetPassword/:token", resetPassword);

router.post("/emails", emails);

export default router;
