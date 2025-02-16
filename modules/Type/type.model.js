import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";

const WarehouseType = sequelize.define("WarehouseType", {
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  image: {
    type: DataTypes.STRING,
  },
  typeStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

export default WarehouseType;
