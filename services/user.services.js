import { client } from "../index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../utils/email.js";
import { ObjectId } from "mongodb";
import emailValidator from "deep-email-validator";

// HASHING THE PASSWORD
const generatePassword = async (password) => {
  const NO_OF_ROUNDS = 10;
  const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
};

// EMAIL VALIDATION
const isEmailValid = async (email) => {
  return emailValidator.validate(email);
};

// GET ALL USERS
export const getAllUsers = async () => {
  return await client.db("emailtool").collection("users").find({}).toArray();
};

// SIGN UP
export const signup = async (req, res, next) => {
  const { name, password, email, company, phone } = req.body;

  const user = await client
    .db("emailtool")
    .collection("users")
    .findOne({ email });

  if (user) {
    res.status(400).json({
      message: "fail",
      status: "User already exists",
    });
  } else {
    const hashedPassword = await generatePassword(password);
    const newUser = await client.db("emailtool").collection("users").insertOne({
      name,
      email,
      password: hashedPassword,
      company,
      phone,
      passwordResetToken: "",
    });

    res.status(200).json({
      message: "success",
      status: "User signedup successfully",
      data: newUser,
    });
  }
};

// lOGIN
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  // Check if user exists or not
  const user = await client
    .db("emailtool")
    .collection("users")
    .findOne({ email });

  if (!user) {
    res.status(401).json({
      status: "fail",
      message: "Invalid login credentials!",
    });
  } else {
    const dbPass = user.password;
    const passwordCheck = await bcrypt.compare(password, dbPass);

    if (passwordCheck) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: "90d",
      });

      res.status(200).json({
        status: "success",
        message: "Successful Login",
        token,
        data: user,
      });
    } else {
      res.status(401).json({
        status: "fail",
        message: "Invalid login credentials!",
      });
    }
  }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res, next) => {
  const user = await client
    .db("emailtool")
    .collection("users")
    .findOne(req.body);

  if (!user) {
    res.status(404).json({
      status: "fail",
      message: "There is no user with this email address",
    });
  }

  // Generate Random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Update Password Reset Token
  const updateUser = await client
    .db("emailtool")
    .collection("users")
    .updateOne({ _id: user._id }, { $set: { passwordResetToken } });

  // const resetUrl = `${req.protocol}://localhost:3000/resetPassword/${resetToken}`;
  const resetUrl = `https://the-bulk-email-sender.vercel.app/resetPassword/${resetToken}`;

  const message = `Forgot your password? Click on this link to submit a new request to reset your password to: ${resetUrl} .\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token",
      message,
    });

    res.status(200).send({
      status: "success",
      message: "Token sent to email",
    });
  } catch (err) {
    await client
      .db("emailtool")
      .collection("users")
      .updateOne(
        { _id: user._id },
        {
          $set: {
            passwordResetToken: "",
          },
        }
      );

    return res.status(500).json({
      status: "fail",
      message: "There was an error sending the email. Please try again later.",
    });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res, next) => {
  console.log(req.params.token);
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await client
    .db("emailtool")
    .collection("users")
    .findOne({ passwordResetToken: hashedToken });

  if (!user) {
    return res.status(400).json({
      status: "fail",
      message: "Token is invalid or expired",
    });
  }

  const hashedPassword = await generatePassword(req.body.password);

  await client
    .db("emailtool")
    .collection("users")
    .updateOne(
      { _id: user._id },
      { $set: { password: hashedPassword, passwordResetToken: "" } }
    );

  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: "90d",
  });

  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
};

// CREATE EMAIL LIST
export const emails = async (req, res, next) => {
  const emails = await client
    .db("emailtool")
    .collection("email")
    .insertMany(req.body);

  res.status(200).json({
    status: "success",
    data: emails,
  });
};

// PROTECT

export const auth = async (req, res, next) => {
  try {
    const token = req.header("token");

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    const currentUser = await client
      .db("emailtool")
      .collection("users")
      .findOne({ _id: ObjectId(decoded.id) });

    if (!currentUser) {
      res.status(401).json({
        status: "fail",
        message: "The user belonging to the token does not exist",
      });
    }

    req.user = currentUser;
    next();
  } catch (err) {
    console.log(err);
    res.status(401).send({ message: err.message });
  }
};

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.token && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(400).send({ message: "No token found" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const currentUser = await client
    .db("emailtool")
    .collection("users")
    .findOne({ _id: ObjectId(decoded.id) });

  if (!currentUser) {
    res.status(401).json({
      status: "fail",
      message: "The user belonging to the token does not exist",
    });
  }

  req.user = currentUser;
  next();
};
