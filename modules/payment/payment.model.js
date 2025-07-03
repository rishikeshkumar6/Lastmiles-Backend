import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";

export const paymentHistoryModel = sequelize.define(
  "paymentHistoryRecords",
  {
    date: {
      type: DataTypes.STRING,
    },
    account_id: {
      type: DataTypes.INTEGER,
    },
    transaction_id: {
      type: DataTypes.STRING,
    },
    order_id: {
      type: DataTypes.STRING,
    },
    transaction_type: {
      type: DataTypes.STRING,
    },
    credit_amount: {
      type: DataTypes.FLOAT,
    },
    debit_amount: {
      type: DataTypes.FLOAT,
    },
    wallet_balance: {
      type: DataTypes.FLOAT,
    },
    currency: {
      type: DataTypes.STRING,
    },
    payment_status: {
      type: DataTypes.STRING,
    },
  },
  { timestamps: true }
);

export const walletModel = sequelize.define("walletRecords", {
  amount: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  account_id: {
    type: DataTypes.INTEGER,
  },
  order_id: {
    type: DataTypes.STRING,
  },
});
