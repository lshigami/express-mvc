const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const db = require("../models");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username", // Thay đổi từ email sang username
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          // Tìm kiếm user theo username
          const user = await db.User.findOne({ where: { username } });

          if (!user) {
            return done(null, false, { message: "User not found" });
          }

          // So sánh password
          const isMatch = await bcrypt.compare(password, user.password);

          if (!isMatch) {
            return done(null, false, { message: "Incorrect password" });
          }

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // Serialize user để lưu vào session
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // Deserialize user từ session
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.User.findByPk(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
