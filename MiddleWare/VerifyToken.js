import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const RefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.send(401, {
        statusCode: 401,
        errorMessage: "refresh token is not available",
      });
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_TOKEN_SECRET_KEY
    ).response;

    const newAccessToken = jwt.sign(
      { decoded },
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      sameSite: process.env.SAME_SITE,
      maxAge: 60 * 60 * 1000, // 1 hours in milliseconds
    });
    console.log("refresh token response", decoded);
    req.user = decoded;

    return next();
  } catch (err) {
    if (
      err instanceof jwt.JsonWebTokenError ||
      err instanceof jwt.TokenExpiredError
    ) {
      res
        .status(404)
        .json({ statusCode: 404, errorMessage: "token is invaid" });
    } else {
      console.log("Internal server error:", err.message);
      return res
        .status(500)
        .send({ errorMessage: `${err} Internal server error` });
    }
  }
};

export const verifyToken = async (req, res, next) => {
  try {
    console.log("verify token is invoked");
    const token = req.cookies.accessToken;
    console.log("token", token);
    if (!token) {
      return res.send(404, { errorMessage: "token is not available" });
    }
    if (token) {
      console.log("token", token);
      const verify = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET_KEY);
      console.log("verify token response", verify);
      if (verify !== undefined) {
        req.user = verify;
        return next();
      } else {
        return res.send(404, { errorMessage: "token is not valid" });
      }
    }
  } catch (err) {
    console.log("invalid token", err instanceof jwt.JsonWebTokenError);
    console.log("expire token", err instanceof jwt.TokenExpiredError);
    if (
      err instanceof jwt.JsonWebTokenError ||
      err instanceof jwt.TokenExpiredError
    ) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
        sameSite: process.env.SAME_SITE,
      });
      RefreshToken(req, res, next);
    } else {
      console.log("Internal server error:", err.message);
      return res
        .status(500)
        .send({ errorMessage: `${err} Internal server error` });
    }
  }
};

export const generateAccessToken = (response) => {
  const token = jwt.sign(
    { response },
    process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: "1h",
    }
  );
  return token;
};
export const generateRefreshToken = (response) => {
  const token = jwt.sign(
    { response },
    process.env.JWT_REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
  return token;
};
