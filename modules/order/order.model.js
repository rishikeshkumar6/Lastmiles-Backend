import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";

export const OrderModel = sequelize.define(
  "OrderRecords",
  {
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
