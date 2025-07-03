import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";
import { shippingModel } from "./shippingorder.model.js";

const OrderModel = sequelize.define(
  "OrderRecords",
  {
    order_id: {
      type: DataTypes.STRING,
      unique: {
        msg: "Order ID must be unique. This one already exists.",
      },
    },
    consigneeDetails: {
      type: DataTypes.JSON,
      allowNull: false,
      default: [],
    },
    pickupDetails: {
      type: DataTypes.JSON,
      default: [],
    },
    orderDetails: {
      type: DataTypes.JSON,
      default: [],
    },
    packageDetails: {
      type: DataTypes.JSON,
      default: [],
    },
    account_id: { type: DataTypes.INTEGER },
    order_status: {
      type: DataTypes.STRING,
      defaultValue: "supicious_order",
    },
  },
  { timestamps: true }
);

export const pickupMoel = sequelize.define(
  "pickupRecords",
  {
    pickup_location_name: { type: DataTypes.STRING },
    pickup_person_name: { type: DataTypes.STRING },
    pickup_person_phone: { type: DataTypes.STRING },
    pickup_person_email: { type: DataTypes.STRING },
    pickup_address: { type: DataTypes.STRING },
    pickup_landmark: { type: DataTypes.STRING },
    pickup_country: { type: DataTypes.STRING },
    pickup_state: { type: DataTypes.STRING },
    pickup_city: { type: DataTypes.STRING },
    pickup_pincode: { type: DataTypes.STRING },
    pickup_location_code: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    pickup_account_id: { type: DataTypes.INTEGER },
    isOtherField: { type: DataTypes.BOOLEAN },
    isActive: { type: DataTypes.BOOLEAN },
  },
  { timestamps: true }
);

export const RateCardModel = sequelize.define("ratecardRecords", {
  bluedart: { type: DataTypes.JSON },
  dtdc: { type: DataTypes.JSON },
  delhivery: { type: DataTypes.JSON },
  ecom: { type: DataTypes.JSON },
  xpressbees: { type: DataTypes.JSON },
  shadowfax: { type: DataTypes.JSON },
  ekart: { type: DataTypes.JSON },
  fedex: { type: DataTypes.JSON },
  dhl: { type: DataTypes.JSON },
});

// In your OrderModel file (where the association is defined)
OrderModel.hasOne(shippingModel, {
  foreignKey: "order_id", // Foreign key in shippingModel
  sourceKey: "order_id", // References order_id in OrderModel
  as: "shippingInfo",
});

shippingModel.belongsTo(OrderModel, {
  foreignKey: "order_id", // Foreign key in shippingModel
  targetKey: "order_id", // Target order_id in OrderModel
  as: "order",
});

export default OrderModel;
