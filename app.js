require("dotenv").config();
const express = require("express");
const expressSession = require("express-session");
const passport = require("./middleware/auth");
const prisma = require("./lib/prisma");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const path = require("node:path");

// Routers
const authRouter = require("./routes/auth.routes");
const indexRouter = require("./routes/index.routes");
const folderRouter = require("./routes/folders.routes");
const fileRouter = require("./routes/files.routes");
const shareRouter = require("./routes/share.routes");

const app = express();

// View engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Static files
const assetsPath = path.join(__dirname, "public");
app.use(express.static(assetsPath));

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session setup
app.use(
  expressSession({
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true,
    }),
    secret: process.env.SESSION_SECRET || "dev_secret_change_me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Global user EJS access
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

// Routes
app.use("/", indexRouter);
app.use("/", authRouter);
app.use("/folders", folderRouter);
app.use("/files", fileRouter);
app.use("/share", shareRouter);


// Error handling
app.use((error, req, res, next) => {
  console.log(error);
  res.status(error.statusCode || 500).render("404");
});

// Server
const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, (error) => {
  if (error) throw new Error(error);
  console.log(`Server is running on port ${PORT}`);
});