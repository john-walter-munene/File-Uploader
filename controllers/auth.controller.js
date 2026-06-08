const passport = require("passport");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { validateRegistration, validateLogin } = require("../middleware/validation");
const { createUserWithRootFolder } = require("../db/queries");


// render register view
const getRegister = (req, res) => (res.render("register", { errors: [], data: {} }));

// handle registration
const postRegister = [
    validateRegistration,

    async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("register", {
                errors: errors.array(),
                data: req.body
            });
        }

        const { firstName, lastName, email, password } = req.body;

        try {

            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await createUserWithRootFolder({
                firstName,
                lastName,
                email: email.toLowerCase().trim(),
                passwordHash: hashedPassword
            });

            return res.redirect("/login");
        } catch (err) {
            console.error(err);
            return res.status(500).render("register", {
                errors: [{ msg: "Signup failed" }],
                data: req.body
            });
        }
    }
];


// login view
const getLogin = (req, res) => (res.render("login", { errors: [], data: {} }));

// login handler
const postLogin = [
    validateLogin,

    async (req, res, next) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("login", {
                errors: errors.array(),
                data: req.body
            });
        }
        
        next();
    },

    passport.authenticate("local", { successRedirect: "/", failureRedirect: "/login"}),
];


// logout
const logout = (req, res, next) => {
    req.logout((err) => {
        if (err) return next(err);
        res.redirect("/");
    });
};


module.exports = {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    logout
};