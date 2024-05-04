import jwt from "jsonwebtoken";
import User from "./models/user.mjs";

export const requireAuth = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "ase secret", (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.redirect("/signin");
      } else {
        console.log(decodedToken);
        next();
      }
    });
  } else {
    res.redirect("/signin");
  }
};

export const checkUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, "ase secret", async (err, decodedToken) => {
      if (err) {
        console.log(err.message);
        res.locals.user = null;
        next();
      } else {
        let user = await User.findById(decodedToken.id);
        if (user) {
          res.locals.user = { id: user._id, email: user.email };
        } else {
          res.locals.user = null;
        }
        next();
      }
    });
  } else {
    res.locals.user = null;
    next();
  }
};
