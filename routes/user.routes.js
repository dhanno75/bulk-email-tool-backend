import express from "express";
import { client } from "../index.js";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  emails,
  getAllUsers,
  auth,
  signupFinish,
} from "../services/user.services.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const data = req.body;

  const users = await client
    .db("emailtool")
    .collection("users")
    .insertMany(data);

  res.status(200).json({
    status: "success",
    data: users,
  });
});

router.get("/allUsers", auth, async (req, res) => {
  const users = await getAllUsers();

  res.status(200).json({
    status: "success",
    data: users,
  });
});

router.post("/signup", signup);

router.get("/verify/:userId/:uniqueString", signupFinish);

router.post("/login", login);

router.post("/forgotPassword", forgotPassword);

router.put("/resetPassword/:token", resetPassword);

router.post("/emails", emails);

export default router;
