import { OrderModel, pickupMoel } from "./order.model.js";
import { sequelize } from "../../DB/config.js";
import { Op } from "sequelize";
const GetSlug = (slug) => {
  switch (slug) {
    case "consignee-details":
      return `consigneeDetails`;
    case "order-details":
      return `orderDetails`;
    case "pickup-details":
      return `pickupDetails`;
    case "package-details":
      return `packageDetails`;
    default:
      return null;
  }
};

export const getOrder = async (req, res) => {
  try {
    if (Object.keys(req.query).length > 0 && req.query.id && req.query.slug) {
      const { id, slug } = req.query;
      const getSlug = GetSlug(slug);
      if (!getSlug) {
        return res.send(401, {
          statusCode: 401,
          errorMessage: "order request is not valid",
        });
      }
      console.log("get slug function return", getSlug);
      const response = await OrderModel.findOne({
        where: {
          id: parseInt(id),
        },
        attributes: [getSlug],
      });
      console.log("reponse", response);
      if (response !== null && Object.keys(response).length > 0) {
        return res.send(200, { orderRes: response });
      }
      if (response === null) {
        return res.send(401, { errorMessage: "order not found" });
      }
    } else {
      return res.send(401, {
        statusCode: 401,
        errorMessage: "order request is not valid",
      });
    }
    return res.send(401, {
      statusCode: 401,
      errorMessage: "order request is not valid",
    });
  } catch (err) {
    console.log(err);
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const getAllOrder = async (req, res) => {
  try {
    console.log(req.query);
    const { page, limit } = req.query;
    const pageCount = await OrderModel.findAndCountAll({
      where: { order_status: "new" },
    });
    const response = await OrderModel.findAll({
      offset: page * limit - limit,
      limit: limit,
      where: {
        order_status: "new",
        [Op.or]: {
          "consigneeDetails.phonenumber": null,
          "consigneeDetails.email": "rishu@gmail.com",
        },
      },
    });
    if (Object.keys(response).length > 0) {
      return res.send(200, {
        orderRes: response,
        pageCount: Math.ceil(pageCount.count / limit),
      });
    } else {
      res.send(404, { errorMessage: "order not found" });
    }
  } catch (err) {
    console.log(err);
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const OrderCreate = async (req, res) => {
  try {
    if (Object.keys(req.body).length > 0) {
      console.log("yes request is get");
      const response = await OrderModel.create({ consigneeDetails: req.body });
      if (response !== null) {
        return res.send(200, {
          orderRes: {
            id: response.id,
            statusCode: 200,
            message: "order inserted successfully",
          },
        });
      }
    }
    return res.send(401, { errorMessage: "body is not provided" });
  } catch (err) {
    console.log("errors", err);
    res.send(500, { errorMessage: `${err} Internal Server Error` });
  }
};

export const OrderUpdate = async (req, res) => {
  try {
    const body = req.body;
    const { id, slug } = req.body;
    const getSlug = GetSlug(slug);
    delete body.id;
    delete body.slug;
    console.log("getslug test", getSlug);
    console.log("body", body);
    const response = await OrderModel.update(
      { [getSlug]: body },
      {
        where: {
          id: id,
        },
      }
    );
    console.log("response", response);
    if (response[0] === 1) {
      return res.send(200, {
        orderRes: {
          statusCode: 200,
          message: "user updated successfully",
        },
      });
    }
    if (response[0] === 0) {
      return res.send(401, { message: "user not found" });
    }
  } catch (err) {
    console.log("error occurs on update", err);
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const pickupCreate = async (req, res) => {
  try {
    const response = await pickupMoel.create(req.body);
    res.send(200, { pickupRes: response });
  } catch (err) {
    console.log("errros", err);
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const bulkOrderCreate = async (req, res) => {
  try {
    console.log("req.body", req.body);
    if (req.body !== null && Object.keys(req.body).length > 0) {
      const response = await OrderModel.bulkCreate(req.body);
      return res.send(200, {
        statusCode: 200,
        orderResponse: "bulk order data inserted successfully",
      });
    } else {
      return res.send(401, {
        statusCode: 401,
        errorMessage: "order is not valid",
      });
    }
  } catch (err) {
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const aggregation = async (req, res) => {
  try {
    const response = await OrderModel.findAll({
      where: sequelize.where(
        sequelize.fn(
          "LENGTH",
          sequelize.json("consigneeDetails.fullname") // Access JSON field
        ),
        {
          [Op.gt]: 15, // Greater than 15
        }
      ),
      attributes: ["consigneeDetails"],
    });
    res.send(200, response);
  } catch (err) {
    console.log(err);
    res.send(500, { errorMessage: "internal server error" });
  }
};
