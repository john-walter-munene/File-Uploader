const passport = require("passport");
const { Router } = require("express");
const authController = require("../controllers/authController");
const authRouter = Router();

authRouter.get("/register", authController.getRegister);
authRouter.post("/register", authController.postRgister);
authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.get("/logout", authController.logout);

module.exports = authRouter;