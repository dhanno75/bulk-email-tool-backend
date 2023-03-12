import express from "express";
import { emailData, sendBulkEmails } from "../services/email.services.js";
import { auth } from "../services/user.services.js";

const router = express.Router();

router.post("/sendEmails", auth, sendBulkEmails);

router.get("/emailsData", auth, emailData);

export default router;
