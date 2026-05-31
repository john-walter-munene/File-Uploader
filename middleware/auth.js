const prisma = require("../lib/prisma");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");

// Local Strategy
passport.use(
  new LocalStrategy(
    { usernameField: "email" },

    async (email, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { email }, });

        if (!user) {
          return done(null, false, { message: "User not found." });
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
    });

    done(null, user || null);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;