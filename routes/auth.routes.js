const passport = require("passport");
const { Router } = require("express");
const authController = require("../controllers/auth.controller");
const authRouter = Router();

authRouter.get("/register", authController.getRegister);
authRouter.post("/register", authController.postRegister);
authRouter.get("/login", authController.getLogin);
authRouter.post("/login", authController.postLogin);
authRouter.post("/logout", authController.logout);

module.exports = authRouter;