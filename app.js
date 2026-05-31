require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const passport = require("./middleware/auth");
const prisma = require("../lib/prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const app = express();
const path = require("node:path");

// Templating engine setup.
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Serving static assets.
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Body parser setup, and authentication session
app.use(express.urlencoded({ extended: false }));
app.use(
    expressSession({
        store: new PrismaSessionStore(
            prisma,
            {
                checkPeriod: 2 * 60 * 1000,
                dbRecordIdIsSessionId: true,
                dbRecordIdFunction: undefined,
            }),
            secret: "cats",
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24, // one day
            }
    })
);

// Passport for authentication setup.
app.use(passport.initialize());
app.use(passport.session());

// Make current user available in all views
app.use((request, response, next) => {
    response.locals.currentUser = request.user;
    next();
});

// Routes

// Error handling
app.use((error, request, response, next) => {
    console.log(error);
    response.status(error.statusCode || 500).render("404");
});

app.get("/", (request, response) => response.render("index"));

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, (error) => {
    if (error) throw new Error(error);
    console.log(`Server is running on port ${PORT}`);
});