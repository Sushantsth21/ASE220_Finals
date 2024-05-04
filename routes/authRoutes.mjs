import express from "express";
import {
  signup_get,
  signin_get,
  signup_post,
  signin_post,
  logout_get,
} from "../controllers/authController.mjs";

const router = express.Router();

router.get("/signup", signup_get);
router.post("/signup", signup_post);
router.get("/signin", signin_get);
router.post("/signin", signin_post);
router.get("/logout", logout_get);

export default router;
