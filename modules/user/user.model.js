import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import { otpGenerator } from "../arithmeticcalculation/otpgenerator.js";
import { walletModel } from "../payment/payment.model.js";
import { WelcomeEmail } from "../message/mail.service.js";
import { MailOtp } from "../message/mailotp.service.js";

export let otpValue = null;
const userModelSchema = sequelize.define(
  "userRecords",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      trim: true,
      validate: {
        notNull: { msg: "name is a required field" },
        notEmpty: { msg: "name cannot be empty" },
        isValidName(value) {
          const regex = /^[A-Za-z\s]+$/;
          if (!regex.test(value)) {
            throw new Error(
              "Name must contain only alphabetic characters and spaces."
            );
          }
        },
        len: {
          args: [2, 255],
          msg: "Name must be at least 2 characters long",
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Email is a required field" },
        notEmpty: { msg: "Email cannot be empty" },
        isEmail: { msg: "Email must be a valid email address" },
      },
    },
    phonenumber: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      unique: true,
      validate: {
        notNull: { msg: "Phone number is a required field" },
        notEmpty: { msg: "Phone number cannot be empty" },
        isNumeric: { msg: "Phone number must contain only numeric characters" },
        len: {
          args: [10, 10],
          msg: "Phone number must be exactly 10 digits",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: "Password is a required field" },
        notEmpty: { msg: "Password cannot be empty" },
        len: {
          args: [8, 255],
          msg: "Password must be at least 8 characters long",
        },
        isStrongPassword(value) {
          // ✅ Skip validation if password is already hashed
          if (!value.startsWith("$2b$")) {
            const regex =
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            if (!regex.test(value)) {
              throw new Error(
                "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character."
              );
            }
          }
        },
      },
    },
    permission: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      validate: {
        notNull: { msg: "Permission is a required field" },
      },
    },
    isOtpVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },

      afterCreate: async (user) => {
        otpValue = otpGenerator();
        try {
          let value = await MailOtp(user.name, user.email, otpValue);
          console.log("value checking", value);
        } catch (err) {
          console.log("error part after create", err);
        }
      },
      beforeUpdate: async (user, options) => {
        console.log("⚡ Before Update hook triggered");
        console.log("🔍 Password before hashing:", user.password);

        if (user.changed("password")) {
          try {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
            console.log("✅ Password hashed successfully:", user.password);
          } catch (error) {
            console.error("❌ Error while hashing password:", error);
          }
        } else {
          console.log("⚠️ Password not changed, skipping hashing.");
        }
      },
    },
  }
);

userModelSchema.hasOne(walletModel, {
  foreignKey: "account_id", // Foreign key in walletModel
  sourceKey: "id", // References userModelSchema in OrderModel
  as: "walletResponse",
});

walletModel.belongsTo(userModelSchema, {
  foreignKey: "account_id", // Foreign key in walletModel
  targetKey: "id", // Target order_id in OrderModel
  as: "walletResponse",
});

export default userModelSchema;
