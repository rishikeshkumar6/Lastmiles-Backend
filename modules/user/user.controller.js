import { userModelSchema } from "./user.model.js";
import { sequelize } from "../../DB/config.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../MiddleWare/VerifyToken.js";
import { otpValue } from "./user.model.js";

export const userRegistration = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const response = await userModelSchema.create(req.body, {
      transaction: t,
    });
    t.commit();
    console.log("response-----", response);
    if (Object.keys(response).length > 0) {
      return res.send(200, {
        statusCode: 200,
        id: response.id,
        message: "user created successfully",
      });
    }
  } catch (error) {
    t.rollback();
    console.log("errorMessage", error);
    res.send(500, { error });
  }
};

export const otpVerification = async (req, res) => {
  try {
    console.log(req.body);
    if (Object.keys(req.body).length > 0) {
      if (req.body.otp === otpValue) {
        const updateResponse = await userModelSchema.update(
          { isOtpVerified: true },
          {
            where: { id: req.body.id },
          }
        );
        if (updateResponse[0] === 1) {
          return res.send(200, {
            statusCode: 200,
            message: "otp verify successfully",
          });
        } else if (updateResponse[0] === 0) {
          return res.send(404, { statusCode: 404, message: "user not found" });
        }
      } else {
        res.send(404, { statusCode: 404, errorMessage: "otp is not valid" });
      }
    }
  } catch (err) {
    console.log(err);
    res.send(500, { errorMessage: "internal server error" });
  }
};

export const userLogin = async (req, res) => {
  try {
    const body = req.body;
    console.log("body", body);
    if (Object.keys(body).length > 0) {
      const response = await userModelSchema.findOne({
        where: {
          [Op.and]: [
            { isOtpVerified: true },
            {
              [Op.or]: {
                email: body.email,
                phonenumber: body.phonenumber !== "" ? body.phonenumber : null,
              },
            },
          ],
        },
      });
      console.log("response", response);
      if (response !== null && Object.keys(response).length > 0) {
        const passwordValidation = await bcrypt.compare(
          body.password,
          response.password
        );

        if (passwordValidation) {
          const accessToken = generateAccessToken(response);
          const refreshToken = generateRefreshToken(response);
          console.log("accessToken", accessToken);
          console.log("refreshToken", refreshToken);
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false, // Only secure in production
            sameSite: "lax", // More flexible than strict
            maxAge: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
          });
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: false, // Only secure in production
            sameSite: "lax", // More flexible than strict
            maxAge: 60 * 60 * 1000, // 1 hours in milliseconds
          });
          return res.send(200, {
            token: accessToken,
          });
        }
      }
      if (response === null) {
        return res.send(404, {
          statusCode: 401,
          errorMessage: "user not found",
        });
      }
    } else {
      return res.send(404, { errorMessage: "data not available" });
    }
  } catch (err) {
    console.log("check error", err);
    res.send(500, { errorMessage: `${err} Internal Server Error` });
  }
};

export const getUser = async (req, res) => {
  try {
    if (req.user["response"] !== undefined) {
      console.log("secend condition execute");
      const { id } = req.user["response"];
      const response = await userModelSchema.findOne({
        where: { id: id },
        attributes: ["id", "name", "email", "phonenumber"],
      });
      return res.send(200, { response });
    }
    if (req.user["decoded"] !== undefined) {
      console.log("secend condition execute");
      const { id } = req.user["decoded"];
      const response = await userModelSchema.findOne({
        where: { id: id },
        attributes: ["id", "name", "email", "phonenumber"],
      });
      return res.send(200, { response });
    }
    const { id } = req.user;
    const response = await userModelSchema.findOne({
      where: { id: id },
      attributes: ["id", "name", "email", "phonenumber"],
    });
    return res.send(200, { response });
  } catch (err) {
    console.log("errorMessage", err);
    res.send(500, "Internal Server Error");
  }
};

export const updateUser = async (req, res) => {
  try {
    if (Object.keys(req.body).length > 0) {
      console.log("req body updateuser check", req.body);
      const id = req.params.id;
      console.log("body json", req.body);
      const email = req.body.contactDetails.email;
      const response = await userModelSchema.update(req.body, {
        where: { id: id },
      });
      console.log(response);
      if (response[0] === 1) {
        res.send(200, { message: "user update successfully" });
      }
      if (response[0] === 0) {
        res.send(200, { message: "user not updated" });
      }
    } else {
      res.send(404, { errorMessage: "user not found" });
    }
  } catch (err) {
    console.log(err);
    res.send(500, "Internal Server Error");
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.params.id) {
      const id = req.params.id;
      console.log(id);
      const response = await userModelSchema.destroy({ where: { id: id } });
      if (response === 1) {
        res.send(200, { message: "user deleted successfully" });
      }
      if (response === 0) {
        res.send(404, { message: "user not found" });
      }
    } else {
      res.send(404, { errorMessage: "user not found" });
    }
  } catch (err) {
    console.log(err);
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const getAllUser = async (req, res) => {
  try {
    console.log(req.query);
    if (req.query.page && req.query.limit) {
      const page = req.query.page;
      const limit = req.query.limit;
      const user = await userModelSchema.findAll({
        offset: page * 10 - 10,
        limit: limit,
        attributes: ["id", "contactDetails", "address"],
        where: { "address.country": "India" },
      });
      const pageCount = await userModelSchema.findAndCountAll();
      console.log(typeof pageCount.count);
      console.log("pagecount", pageCount.count);
      const pages = Math.ceil(pageCount.count / 10);
      console.log("userResponse Check>>>>>>>", user);
      return res.send(200, {
        message: user,
        page: pages,
      });
    }
  } catch (err) {
    return res.send(500, { errorMessage: "Internal Server Error" });
  }
};
