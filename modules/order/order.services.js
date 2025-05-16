import { pickupMoel } from "./order.model.js";
import OrderModel from "./order.model.js";
import { sequelize } from "../../DB/config.js";
import { DOUBLE, Op } from "sequelize";
import { shippingModel } from "./shippingorder.model.js";
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

function isValidEmail(input) {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

const trackingNumber = (pr = "UB775", su = "HK") => {
  pr += ~~(Math.random() * 100000);
  return pr + su;
};

function isValidPhoneNumber(input) {
  // Basic phone number validation
  const phoneRegex = /^\d{10}$/; // Adjust regex as per your requirements
  return phoneRegex.test(input);
}

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
    console.log("request query", req.query);
    const { page, batchSize, order_status, start_date, end_date, searchTerm } =
      req.query;

    // Parse parameters with defaults
    const pageInt = parseInt(page) || 1;
    const batchSizeInt = parseInt(batchSize) || 10;
    const startDate = new Date(`${start_date}T00:00:00.000Z`); // Start of the day
    const endDate = new Date(`${end_date}T23:59:59.999Z`);

    // Build the where clause based on order_status
    const whereClause = {};

    if (order_status && start_date && end_date) {
      whereClause.order_status = order_status;
      whereClause.createdAt = {
        [Op.between]: [startDate, endDate],
      };
    }

    const isEmail = isValidEmail(searchTerm);

    const isPhonenumber = isValidPhoneNumber(searchTerm);

    if (isEmail) whereClause["consigneeDetails.email"] = searchTerm;

    if (isPhonenumber) whereClause["consigneeDetails.phonenumber"] = searchTerm;

    if (searchTerm && !isEmail && !isPhonenumber)
      whereClause["orderDetails.orderid"] = searchTerm;

    // Get total count of records matching the filter
    const countResult = await OrderModel.findAndCountAll({
      where: whereClause,
    });

    // Calculate offset based on page and batchSize
    const offset = (pageInt - 1) * batchSizeInt;

    // Retrieve paginated data
    if (order_status === "new") {
      const response = await OrderModel.findAll({
        offset: offset,
        limit: batchSizeInt,
        where: whereClause,
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (response.length > 0) {
        return res.status(200).json({
          orderRes: response,
          pageCount: Math.ceil(countResult.count / batchSizeInt),
        });
      } else {
        console.log("response", response);
        res.status(404).json({ errorMessage: "Order not found" });
      }
    }
    if (order_status === "booked") {
      const response = await OrderModel.findAll({
        offset: offset,
        limit: batchSizeInt,
        where: whereClause,
        include: [
          {
            model: shippingModel,
            as: "shippingInfo", // Update this if you define an alias
            attributes: [
              "id",
              "awb_number",
              "order_id",
              "courier_partner",
              "booking_date",
              "tracking_info",
            ],
          },
        ],
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      });

      if (response.length > 0) {
        return res.status(200).json({
          orderRes: response,
          pageCount: Math.ceil(countResult.count / batchSizeInt),
        });
      } else {
        console.log("response", response);
        res.status(404).json({ errorMessage: "Order not found" });
      }
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ errorMessage: `${err} Internal Server Error` });
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
      { [getSlug]: body, order_id: body["orderid"] },
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

export const generateLabel = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await OrderModel.findOne({ where: { id: id } });
    if (!response)
      return res
        .status(401)
        .json({ statusCode: 401, errorMessage: "order record not found" });
    return res.status(200).json({
      statusCode: 200,
      orderRes: response,
    });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server error" });
  }
};

export const shippingOrder = async (req, res) => {
  try {
    const body = req.body;
    const { id, orderDetails } = req.body;
    const shippingResponse = await shippingModel.create({
      order_id: orderDetails.orderid,
      courier_partner: orderDetails.channel,
    });
    const response = await OrderModel.update(
      { order_status: "booked" },
      {
        where: {
          id: id,
        },
      }
    );
    res.status(200).json({
      statusCode: 200,
      message: "the order is shipped successfully",
      response,
      shippingResponse,
    });
  } catch (err) {
    res.status(500).json({ statusCode: 500, err });
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
