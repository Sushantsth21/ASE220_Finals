import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import User from "../models/user.mjs";
import jwt from "jsonwebtoken";

const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  if (err.message === "incorrect email") {
    errors.email = "that email is not registered";
  }

  if (err.message === "incorrect password") {
    errors.password = "that password is incorrect";
  }

  if (err.code === 11000) {
    errors.email = "that email is already registered";
    return errors;
  }

  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "ase secret", {
    expiresIn: maxAge,
  });
};

export const signup_get = (req, res) => {
  res.sendFile(
    "/Users/sushantshrestha/Desktop/ase/ASE220-Mid-term/public/signup.html"
  );
};

export const signin_get = (req, res) => {
  res.sendFile(
    "/Users/sushantshrestha/Desktop/ase/ASE220-Mid-term/public/signin.html"
  );
};

export const signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

export const signin_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

export const logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/");
};
