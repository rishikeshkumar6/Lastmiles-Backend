import { pickupMoel, RateCardModel } from "./order.model.js";
import OrderModel from "./order.model.js";
import { sequelize } from "../../DB/config.js";
import { DOUBLE, Op, where } from "sequelize";
import { shippingModel } from "./shippingorder.model.js";
import axios from "axios";
import { Json } from "sequelize/lib/utils";
import { paymentHistoryModel, walletModel } from "../payment/payment.model.js";
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

function isValidPincode(input) {
  const phoneRegex = /^\d{6}$/; // Adjust regex as per your requirements
  return phoneRegex.test(input);
}

function isUniqueBulkId(db, payload) {
  const newArray = payload.filter((elem) => db.includes(elem));
  if (newArray.length > 0) return false;
  return true;
}

export const RateCard = async (req, res) => {
  try {
    const body = req.body;
    const response = await RateCardModel.create(body);
    res.status(200).json({ statusCode: 200, response });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server error" });
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
    console.log("request query", req.query);
    const { page, batchSize, order_status, start_date, end_date, searchTerm } =
      req.query;
    const { id } = req.user["response"];
    console.log("userid", id);

    // Parse parameters with defaults
    const pageInt = parseInt(page) || 1;
    const batchSizeInt = parseInt(batchSize) || 10;
    const startDate = new Date(`${start_date}T00:00:00.000Z`); // Start of the day
    const endDate = new Date(`${end_date}T23:59:59.999Z`);

    // Build the where clause based on order_status
    const whereClause = {};
    console.log(
      "---------condition checking-------",
      order_status && id && start_date && end_date
    );
    if (order_status && id && start_date && end_date) {
      whereClause.order_status = order_status;
      whereClause.account_id = id;
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
    console.log("whereClause", whereClause);
    // Get total count of records matching the filter
    const countResult = await OrderModel.findAndCountAll({
      where: whereClause,
    });

    // Calculate offset based on page and batchSize
    const offset = (pageInt - 1) * batchSizeInt;

    // Retrieve paginated data

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
        return res.status(404).json({ errorMessage: "Order not found" });
      }
    }

    if (order_status === "all") {
      delete whereClause.order_status;
      const countResult = await OrderModel.findAndCountAll({
        where: whereClause,
      });
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
        return res.status(404).json({ errorMessage: "Order not found" });
      }
    }

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
      return res.status(404).json({ errorMessage: "Order not found" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ errorMessage: `${err} Internal Server Error` });
  }
};

export const DeleteOrder = async (req, res) => {
  try {
    const { orderid } = req.body;
    const deleteResponse = await OrderModel.destroy({
      where: { id: orderid },
    });
    if (deleteResponse === 1)
      return res.status(200).json({
        statusCode: 200,
        message: "order has been deleted successfully",
      });

    if (deleteResponse === 0)
      return res.status(401).json({
        statusCode: 401,
        message: "order delete failed",
      });
  } catch (err) {
    res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server Error" });
  }
};

export const OrderCreate = async (req, res) => {
  try {
    const { id } = req.user["response"];
    if (Object.keys(req.body).length > 0) {
      console.log("yes request is get");
      const response = await OrderModel.create({
        consigneeDetails: req.body,
        account_id: id,
      });
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
    const { id, slug } = body;
    const parsedId = parseInt(id);
    const getSlug = GetSlug(slug); // Determines which part of the order is being updated

    // Remove id and slug from the body to prevent updating them
    delete body.id;
    delete body.slug;

    // Fetch the order based on ID, excluding some fields
    const orderGetResponse = await OrderModel.findOne({
      where: { id: parsedId },
      attributes: {
        exclude: ["createdAt", "updatedAt", "order_status"],
      },
    });

    const { pickupDetails, orderDetails, packageDetails } = orderGetResponse;

    // If pickupDetails and orderDetails are present
    if (pickupDetails !== null && orderDetails !== null) {
      if (getSlug === "pickupDetails") {
        // First deactivate all pickups for the given account ID
        await pickupMoel.update(
          { isActive: false },
          { where: { pickup_account_id: body.pickup_account_id } }
        );

        // Then activate the new pickup location
        await pickupMoel.update(
          { isActive: true },
          { where: { pickup_location_code: body.pickup_location_code } }
        );
      }

      // Update the order with new data
      if (getSlug === "orderDetails") {
        const response = await OrderModel.update(
          {
            [getSlug]: body,
            order_id: body["orderid"],
            order_status: "new",
          },
          { where: { id: parsedId } }
        );
      }
      const response = await OrderModel.update(
        {
          [getSlug]: body,
          order_status: "new",
        },
        { where: { id: parsedId } }
      );

      // Send appropriate response based on update result
      if (response[0] === 1) {
        return res.send(200, {
          orderRes: {
            statusCode: 200,
            message: "Order updated successfully",
          },
        });
      } else {
        return res.send(401, { message: "Order not found" });
      }
    }

    // If pickupDetails need to be updated but were null earlier
    if (getSlug === "pickupDetails") {
      await pickupMoel.update(
        { isActive: false },
        { where: { pickup_account_id: body.pickup_account_id } }
      );

      await pickupMoel.update(
        { isActive: true },
        { where: { pickup_location_code: body.pickup_location_code } }
      );
    }

    // Final update if initial conditions weren't met
    if (getSlug === "orderDetails") {
      const response = await OrderModel.update(
        {
          [getSlug]: body,
          order_id: body["orderid"],
        },
        { where: { id: parsedId } }
      );
    }
    const response = await OrderModel.update(
      {
        [getSlug]: body,
      },
      { where: { id: parsedId } }
    );

    if (response[0] === 1) {
      return res.send(200, {
        orderRes: {
          statusCode: 200,
          message: "User updated successfully",
        },
      });
    } else {
      return res.send(401, { message: "User not found" });
    }
  } catch (err) {
    console.error("Error occurred during order update:", err);
    return res.send(500, {
      errorMessage: `${err}`,
    });
  }
};

export const ManageProduct = async (req, res) => {
  try {
    const { page, batchSize, searchterm } = req.query;
    console.log("page and batchSize", page, batchSize, searchterm);
    const offset = page * batchSize - batchSize;
    const BatchSize = page * batchSize;
    const response = await OrderModel.findAll({
      attributes: ["orderDetails"],
      where: {
        orderDetails: { [Op.ne]: null },
      },
    });
    if (response.length > 0) {
      const productRes = response.flatMap((elem) => {
        const { orderid, channel, productDetails } = elem.orderDetails;
        return productDetails.map((elem) => {
          return {
            orderid,
            channel,
            ...elem,
          };
        });
      });
      const pageCount = Math.ceil(productRes.length / 10);
      const newResponse = JSON.parse(JSON.stringify(productRes));

      const goodsResponse = newResponse.slice(offset, BatchSize);
      return res.status(200).json({
        statusCode: 200,
        goodsResponse,
        pageCount,
        productRes,
      });
    }
    return res.status(200).json({
      statusCode: 200,
      goodsResponse: [],
    });
  } catch (err) {
    console.log("-----error message order details-----", err);
    return res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { orderid, sku_code } = req.body;
    const response = await OrderModel.findAll({
      where: { "orderDetails.orderid": orderid },
      attributes: ["orderDetails"],
    });
    const index = response[0].orderDetails.productDetails.findIndex(
      (elem) => elem.sku_code === sku_code
    );
    response[0].orderDetails.productDetails[index] = req.body;
    const updateResponse = await OrderModel.update(
      {
        orderDetails: response[0].orderDetails,
      },
      { where: { "orderDetails.orderid": orderid } }
    );
    if (updateResponse[0] === 1) {
      return res.status(200).json({
        statusCode: 200,
        message: "product update successfully",
      });
    }
    if (updateResponse[0] === 0) {
      return res.status(401).json({
        statusCode: 401,
        errorMessage: "product not updated",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { orderid, sku_code } = req.body;
    let response = await OrderModel.findOne({
      where: { "orderDetails.orderid": orderid },
      attributes: ["orderDetails"],
    });
    response.orderDetails["productDetails"] =
      response.orderDetails.productDetails.filter(
        (elem) => elem.sku_code !== sku_code
      );
    const updateResponse = await OrderModel.update(
      {
        orderDetails: response.orderDetails,
      },
      { where: { "orderDetails.orderid": orderid } }
    );
    if (updateResponse[0] === 1) {
      return res
        .status(200)
        .json({ statusCode: 200, message: "product deleted successfully" });
    }
    if (updateResponse[0] === 0) {
      return res
        .status(200)
        .json({ statusCode: 401, errorMessage: "product not deleted" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server error" });
  }
};

export const pickupCreate = async (req, res) => {
  try {
    const { id } = req.user["response"];
    const body = req.body;
    body["pickup_account_id"] = id;
    const response = await pickupMoel.create(body);
    if (Object.keys(response).length > 0) {
      return res.send(200, {
        statusCode: 200,
        message: "pickup location created successfully",
      });
    }
    return res
      .status(401)
      .json({ statusCode: 401, errorMessage: "pickup is not created" });
  } catch (err) {
    console.log("errros", err);
    return res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const getAllPickup = async (req, res) => {
  try {
    const { page, batchSize, searchTerm } = req.query;
    if (!page && !batchSize && !searchTerm) {
      const pickupResponse = await pickupMoel.findAll({
        attributes: {
          exclude: ["createdAt", "updatedAt", "id"],
        },
      });
      return res.status(200).json({ statusCode: 200, pickupResponse });
    }
    const whereClause = {};
    if (isValidEmail(searchTerm)) whereClause.pickup_person_email = searchTerm;
    if (isValidPhoneNumber(searchTerm))
      whereClause.pickup_person_phone = searchTerm;
    if (isValidPincode(searchTerm)) whereClause.pickup_pincode = searchTerm;
    if (
      !whereClause.pickup_person_email &&
      !whereClause.pickup_person_phone &&
      !whereClause.pickup_pincode &&
      searchTerm
    )
      whereClause.pickup_location_name = searchTerm;

    const offset = (page - 1) * batchSize;
    const pageCount = await pickupMoel.findAndCountAll({
      where: whereClause,
    });
    const pickupResponse = await pickupMoel.findAll({
      offset: offset,
      limit: batchSize,
      where: whereClause,
      attributes: {
        exclude: ["createdAt", "updatedAt", "id"],
      },
    });
    const pages = Math.ceil(pageCount.count / 10);
    return res.status(200).send({
      statusCode: 200,
      pickupResponse,
      pages,
      page,
      batchSize,
      searchTerm,
    });
  } catch (err) {
    console.log("err", err);
    return res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server error" });
  }
};

export const deletePickup = async (req, res) => {
  try {
    const { pickup_location_code } = req.body;
    const response = await pickupMoel.destroy({
      where: { pickup_location_code },
    });
    if (response === 1) {
      return res.status(200).json({
        statusCode: 200,
        message: "pickup location delete successfully",
      });
    }
    if (response === 0) {
      return res.status(401).json({
        statusCode: 401,
        errorMessage: "pickup location delete failed",
      });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ statusCode: 500, errorMessage: "internal server error" });
  }
};

export const updatePickupStatus = async (req, res) => {
  try {
    const { pickup_location_code, pickup_account_id } = req.body;
    await pickupMoel.update(
      { isActive: false },
      { where: { pickup_account_id: pickup_account_id } }
    );
    const response = await pickupMoel.update(
      { isActive: true },
      { where: { pickup_location_code: pickup_location_code } }
    );

    if (response[0] === 1)
      return res.status(200).json({
        statusCode: 200,
        message: "pickup status update successfully",
      });
    if (response[0] === 0)
      return res
        .status(401)
        .json({ statusCode: 401, errorMessage: `pickup status update failed` });
  } catch (err) {
    console.log("errors", err);
    return res.status(500).json({ statusCode: 500, errorMessage: `${err}` });
  }
};

export const updatePickup = async (req, res) => {
  try {
    const { pickup_location_code } = req.body;
    const body = req.body;
    delete body.isActive;
    const response = await pickupMoel.update(body, {
      where: { pickup_location_code: pickup_location_code },
    });
    if (response[0] === 1) {
      return res.status(200).json({
        statusCode: 200,
        message: "pickup location update successfully",
      });
    }
    if (response[0] === 0) {
      return res
        .status(401)
        .json({ statusCode: 401, message: "pickup location update failed" });
    }
  } catch (err) {
    console.log("errors", err);
    return res.status(500).json({ statusCode: 500, errorMessage: `${err}` });
  }
};

export const bulkOrderCreate = async (req, res) => {
  try {
    const { id } = req.user["response"];
    const body = req.body;

    if (req.body !== null && Object.keys(req.body).length > 0) {
      const orderIds = await OrderModel.findAll({
        attributes: [
          [sequelize.literal(`"orderDetails"->>'orderid'`), "orderid"],
        ],
        raw: true,
      });
      const arr = orderIds.map((elem) => {
        return elem.orderid;
      });
      const newArray = body.map((elem, index) => {
        body[index]["account_id"] = id;
        body[index]["order_id"] = elem.orderDetails.orderid;
        return elem.orderDetails.orderid;
      });
      const isUniqueId = isUniqueBulkId(arr, newArray);
      if (isUniqueId) {
        const response = await OrderModel.bulkCreate(body);
        return res.send(200, {
          statusCode: 200,
          message: "bulk order data inserted successfully",
        });
      }
      return res.send(409, {
        statusCode: 409,
        errorMessage: "order id already exist",
      });
    } else {
      return res.send(401, {
        statusCode: 401,
        errorMessage: "order is not valid",
      });
    }
  } catch (err) {
    console.log("error message data", err);
    res.send(500, { errorMessage: `${err} Internal Server Error` });
  }
};

export const generateLabel = async (req, res) => {
  try {
    const { id } = req.body;
    const response = await OrderModel.findOne({
      where: { id: id },
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
  const transaction = await sequelize.transaction();
  try {
    const { id: Id } = req.user["response"];
    const transactionId = `${Date.now().toString()}-${Id}`;
    const {
      orderid,
      channel,
      id,
      freight_rate,
      min_weight,
      weight,
      estimated_pickup_date,
      estimate_delivey_date,
      rto_rate,
    } = req.body;

    const walletBalanceCheck = await walletModel.findOne({
      where: { account_id: Id },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!walletBalanceCheck) {
      await transaction.rollback();
      return res.status(404).json({ message: "Wallet not found." });
    }

    const walletResponse = JSON.parse(JSON.stringify(walletBalanceCheck));

    if (parseFloat(walletResponse.amount) < parseFloat(freight_rate)) {
      await transaction.rollback();
      return res.status(401).json({
        statusCode: 401,
        message: "Wallet balance is less than the shipment price.",
      });
    }

    const updatedAmmount =
      parseFloat(walletResponse.amount) - parseFloat(freight_rate);

    await walletModel.update(
      { amount: updatedAmmount },
      { where: { account_id: Id }, transaction }
    );

    const now = new Date();
    const pad = (n) => n.toString().padStart(2, "0");
    const formattedDate = `${now.getFullYear()}-${pad(
      now.getMonth() + 1
    )}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(
      now.getMinutes()
    )}:${pad(now.getSeconds())}`;

    await paymentHistoryModel.create(
      {
        date: formattedDate,
        account_id: Id,
        transaction_id: transactionId,
        order_id: "N/A",
        transaction_type: "shipment booked",
        credit_amount: 0,
        debit_amount: freight_rate,
        wallet_balance: updatedAmmount,
        payment_status: "SUCCESS",
        currency: "INR",
      },
      { transaction }
    );

    const shippingResponse = await shippingModel.create(
      {
        order_id: orderid,
        courier_partner: channel,
        freight_rate,
        min_weight,
        weight,
        estimated_pickup_date,
        estimate_delivey_date,
        rto_rate,
      },
      { transaction }
    );

    const response = await OrderModel.update(
      { order_status: "booked" },
      { where: { id: id }, transaction }
    );

    // Commit the transaction
    await transaction.commit();

    return res.status(200).json({
      statusCode: 200,
      message: "The order is shipped successfully",
      response,
      shippingResponse,
    });
  } catch (err) {
    console.log("error message checking", err);
    // Rollback on any error
    if (transaction) await transaction.rollback();
    console.error(err);
    return res.status(500).json({
      statusCode: 500,
      message: "An error occurred while processing the shipment.",
      error: err.message,
    });
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

const pincodeDistance = async (pincode) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json`
    );
    console.log(1145);
    console.log("<<<<response data>>>>", response.data[0].lat);
    // const { lat, lon } = response.data[0];
    return {
      lat: parseFloat(response.data[0].lat),
      lon: parseFloat(response.data[0].lon),
    };
  } catch (err) {
    console.log(err);
  }
};
// Calculate distance using Haversine formula
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in KM
  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

function estimateDeliveryDays(distanceKm) {
  if (distanceKm < 100) {
    return 1; // 1 day for short distances
  } else if (distanceKm < 500) {
    return 3; // 3 days for medium distances
  } else {
    return Math.ceil(distanceKm / 200); // 1 day per 200km for longer distances
  }
}

function getExpectedDeliveryDate(estimatedDays) {
  const today = new Date();
  const deliveryDate = new Date(today);
  deliveryDate.setDate(today.getDate() + estimatedDays);
  return deliveryDate.toLocaleDateString(); // Format as desired
}

function getExpectedPickupDate(distanceInKm) {
  const today = new Date();
  let addDays = 0;

  if (distanceInKm <= 50) {
    addDays = 0; // Same day
  } else if (distanceInKm <= 200) {
    addDays = 1;
  } else if (distanceInKm <= 500) {
    addDays = 2;
  } else {
    addDays = 3;
  }

  const expectedDate = new Date(today);
  expectedDate.setDate(today.getDate() + addDays);

  // Format YYYY-MM-DD
  return expectedDate.toISOString().slice(0, 10);
}

export const freightRate = async (req, res) => {
  try {
    const { pickup_pincode, consignee_pincode, weight } = req.body;
    const pickupResponse = await pincodeDistance(parseInt(pickup_pincode));
    const consigneeResponse = await pincodeDistance(consignee_pincode);

    const distance = calculateDistanceKm(
      pickupResponse.lat,
      pickupResponse.lon,
      consigneeResponse.lat,
      consigneeResponse.lon
    );
    const estimateDeliveryDate = estimateDeliveryDays(distance);
    const formatedDate = getExpectedDeliveryDate(estimateDeliveryDate);
    const expectedPickupDate = getExpectedPickupDate(distance);
    const rateCardResponse = await RateCardModel.findAll({
      attributes: {
        exclude: ["id", "createdAt", "updatedAt"],
      },
    });
    let freightResponse = {
      bluedart: {},
      dtdc: {},
      delhivery: {},
      ecom: {},
      xpressbees: {},
      shadowfax: {},
      ekart: {},
      fedex: {},
      dhl: {},
    };
    const newJsonData = JSON.parse(JSON.stringify(rateCardResponse[0]));
    for (let key in newJsonData) {
      console.log(newJsonData[key]);
      const { img_url, min_weight } = newJsonData[key];
      const { base, per_km, per_kg } = newJsonData[key]["forward"];
      const {
        base: rto_base,
        per_km: rto_perkm,
        per_kg: rto_perkg,
      } = newJsonData[key]["rto"];
      freightResponse[key]["freight_rate"] =
        base + distance * per_km + 1 * per_kg;
      freightResponse[key]["rto_rate"] =
        rto_base + distance * rto_perkm + 1 * rto_perkg;
      freightResponse[key]["img_url"] = img_url;
      freightResponse[key]["min_weight"] = min_weight;
      freightResponse[key]["estimate_delivey_date"] = formatedDate;
      freightResponse[key]["estimated_pickup_date"] = expectedPickupDate;
      freightResponse[key]["weight"] = weight;
    }

    return res.status(200).json({
      statusCode: 200,
      freightResponse,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      errorMessage: `An Internal Server Error Occurs`,
    });
  }
};
