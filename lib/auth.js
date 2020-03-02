import axios from "axios";
import Router from "next/router";

axios.defaults.withCredentials = true;

const WINDOW_USER_SCRIPT_VARIABLE = "__user__";

export const loginUser = async (email, password) => {
  const { data } = await axios.post("/api/login", {
    email,
    password
  });

  if (typeof window !== "undefined") {
    window[WINDOW_USER_SCRIPT_VARIABLE] = data || {};
  }

  console.log(data);
};

export const getUserProfile = async (email, password) => {
  const { data } = await axios.get("/api/profile");
  return data;
};

export const getServerSideToken = req => {
  const { signedCookies = {} } = req;

  if (!signedCookies) {
    return {};
  } else if (!signedCookies.token) {
    return {};
  }

  return { user: signedCookies.token };
};

export const getClientSideToken = () => {
  if (typeof window !== "undefined") {
    const user = window[WINDOW_USER_SCRIPT_VARIABLE] || {};
    return { user };
  }
  return { user: {} };
};

export const getUserScript = user => {
  return `${WINDOW_USER_SCRIPT_VARIABLE} = ${JSON.stringify(user)};`;
};

// Higher Order Function
export const authInitialProps = isProtectedRoute => ({ req, res }) => {
  const auth = req ? getServerSideToken(req) : getClientSideToken();
  const currentPath = req ? req.url : window.location.pathname;
  const user = auth.user;
  const isAnonymous = !user || user.type !== "authenticated";

  if (isProtectedRoute && isAnonymous && currentPath !== "/login") {
    return _redirectUser(res, "/login");
  }

  return { auth };
};

const _redirectUser = (res, path) => {
  // Server side redirect for hard loaded deep linked page
  if (res) {
    res.redirect(302, path); // sending 302 error code is important for SEO
    res.finished = true; // tells next not to keep redirecting or something
    return {};
  }

  Router.replace(path);

  return {};
};

export const logoutUser = async () => {
  if (typeof window !== "undefined") {
    window[WINDOW_USER_SCRIPT_VARIABLE] = {};
  }
  await axios.post("/api/logout");
  Router.push("/login");
};