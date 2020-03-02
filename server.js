const next = require("next");
const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");

const port = process.env.PORT || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const AUTH_USER_TYPE = "authenticated";
const COOKIE_SECRET = "abc123";
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: !dev, // only allow on https on prod
  signed: true
};

const authenticate = async (email, password) => {
  const { data } = await axios.get(
    "https://jsonplaceholder.typicode.com/users"
  );
  return data.find(user => {
    if (user.email === email && user.website === password) {
      return user;
    }
  });
};

app.prepare().then(() => {
  const server = express();

  // Middlewares
  server.use(express.json());
  server.use(cookieParser(COOKIE_SECRET));

  // Endpoints
  server.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    const user = await authenticate(email, password);

    if (!user) {
      return res.status(403).send("Invalid email or password"); // 403 = forbidden
    }

    const userData = {
      name: user.name,
      email: user.email,
      type: AUTH_USER_TYPE
    };

    res.cookie("token", userData, COOKIE_OPTIONS);
    res.json(userData);
  });

  server.post("/api/logout", async (req, res) => {
    res.clearCookie("token", COOKIE_OPTIONS);
    res.sendStatus(204); // 204 = no content response
  });

  server.get("/api/profile", async (req, res) => {
    const { signedCookies = {} } = req; // axios will send all cookies in the header due to "withCredentials" option set in auth.js
    console.log("signedCookies -->", signedCookies);
    const { token } = signedCookies;

    if (token && token.email) {
      const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/users"
      );
      const userProfile = data.find(user => user.email === token.email);
      res.json({ user: userProfile });
    }

    res.statusCode(404);
  });

  // Catch all route
  server.get("*", (req, res) => {
    return handle(req, res);
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`Listening on port ${port}`);
  });
});