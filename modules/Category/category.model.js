import { sequelize } from "../../DB/config.js";
import { DataTypes } from "sequelize";

const Category = sequelize.define("Category", {
  categoryName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  image: {
    type: DataTypes.STRING,
  },
  categoryStatus: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

export default Category;
