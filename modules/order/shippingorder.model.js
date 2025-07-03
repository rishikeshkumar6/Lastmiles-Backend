import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";
const trackingNumber = (pr = "UB775", su = "HK") => {
  pr += ~~(Math.random() * 100000);
  return pr + su;
};

const CurrentDateAndTime = () => {
  const options = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };

  const formatter = new Intl.DateTimeFormat("en-IN", options);
  const istDateTime = formatter.format(new Date());
  return istDateTime;
};
export const shippingModel = sequelize.define(
  "shippingRecords",
  {
    awb_number: {
      type: DataTypes.STRING,
      defaultValue: trackingNumber(),
    },
    order_id: {
      type: DataTypes.STRING,
      unique: true,
    },
    courier_partner: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    booking_date: {
      type: DataTypes.STRING,
      defaultValue: CurrentDateAndTime(),
    },
    freight_rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    rto_rate: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    estimate_delivey_date: {
      type: DataTypes.STRING,
    },
    estimated_pickup_date: {
      type: DataTypes.STRING,
    },
    min_weight: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    weight: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    tracking_info: {
      type: DataTypes.JSON,
    },
  },
  { timestamps: true }
);
