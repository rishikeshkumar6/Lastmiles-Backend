import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";
import { userModelSchema } from "../user/user.model.js";
import WarehouseType from "../Type/type.model.js";
import Category from "../Category/category.model.js";
const WarehouseRecord = sequelize.define("WarehouseRecords", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  warehouseId: {
    type: DataTypes.STRING,
    unique: true,
  },
  warehouseName: {
    type: DataTypes.STRING,
  },
  warehouseCategory: {
    type: DataTypes.INTEGER,
  },
  warehouseType: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  warehouseState: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  warehouseContacts: {
    type: DataTypes.JSON,
    allowNull: false,
    default: [],
  },
  warehouseStorageSpaces: {
    type: DataTypes.JSON,
    default: [],
  },
  warehouseItInfras: {
    type: DataTypes.JSON,
    default: [],
  },
  warehouseMHInfras: {
    type: DataTypes.JSON,
    default: [],
  },
  warehouseSecurities: {
    type: DataTypes.JSON,
    default: [],
  },
  permits: {
    type: DataTypes.JSON,
    default: [],
  },
  warehouseMaterialTypes: {
    type: DataTypes.JSON,
    default: [],
  },
  warehouseImages: {
    type: DataTypes.JSON,
    default: [],
  },
  warehouseFormEighty: {
    type: DataTypes.JSON,
    default: [],
  },
  vendorStatus: {
    type: DataTypes.STRING,
  },
  adminStatus: {
    type: DataTypes.STRING,
  },
  creatorUserId: {
    type: DataTypes.INTEGER,
  },
  accountId: {
    type: DataTypes.STRING,
  },
},{});

WarehouseRecord.belongsTo(WarehouseType, {
  foreignKey: "warehouseType",
  as: "type",
});
WarehouseRecord.belongsTo(Category, {
  foreignKey: "warehouseCategory",
  as: "category",
});

export default WarehouseRecord;
