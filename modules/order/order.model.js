import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";
import { shippingModel } from "./shippingorder.model.js";

const OrderModel = sequelize.define(
  "OrderRecords",
  {
    order_id: {
      type: DataTypes.STRING,
      unique: true,
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
    order_status: {
      type: DataTypes.STRING,
      defaultValue: "new",
    },
  },
  { timestamps: true }
);

export const pickupMoel = sequelize.define(
  "pickupRecords",
  {
    locationname: { type: DataTypes.STRING },
    phonenumber: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    fulladdress: { type: DataTypes.STRING },
    landmark: { type: DataTypes.STRING },
    country: { type: DataTypes.STRING },
    state: { type: DataTypes.STRING },
    city: { type: DataTypes.STRING },
    pincode: { type: DataTypes.STRING },
  },
  { timestamps: true }
);

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
