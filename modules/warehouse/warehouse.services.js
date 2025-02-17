import Category from "../Category/category.model.js";
import WarehouseType from "../Type/type.model.js";
import WarehouseRecord from "./warehouse.model.js";
import { Op } from "sequelize";

/*Get Warehouse Record*/

export const getWarehouseRecord = async (req, res) => {
  try {
    if (req.query.category !== "") {
      console.log("if statement");
      const page = req.query.page;
      const limit = req.query.limit;
      const totalCount = await WarehouseRecord.findAndCountAll({
        where: {
          adminStatus: ["Listed_but_Unverified", "Listed_and_Verified"],
          warehouseCategory: ["1"],
        },
      });

      const warehouseResponse = await WarehouseRecord.findAll({
        offset: page * 10 - 10,
        limit: limit,
        where: {
          adminStatus: ["Listed_but_Unverified", "Listed_and_Verified"],
          warehouseCategory: ["1"],
        },
        attributes: [
          "id",
          "warehouseName",
          "warehouseState",
          "warehouseType",
          "warehouseCategory",
          "warehouseContacts",
          "warehouseStorageSpaces",
          "warehouseImages",
        ],
      });
      console.log("totalCount Page", totalCount);
      res.send(200, {
        warehouseRes: warehouseResponse,
        page: Math.ceil(totalCount.count / 10),
      });
    } else {
      console.log("else statement");
      const { page, limit, start_date, end_date } = req.query;
      console.log("date checker", new Date(start_date), new Date(end_date));
      const totalCount = await WarehouseRecord.findAndCountAll({
        where: {
          adminStatus: ["Listed_but_Unverified", "Listed_and_Verified"],
          createdAt: {
            [Op.between]: [
              new Date(`${start_date} T00:00:00Z`),
              new Date(`${end_date}T23:59:59Z`),
            ],
          },
        },
      });

      const warehouseResponse = await WarehouseRecord.findAll({
        offset: page * 10 - 10,
        limit: limit,
        where: {
          adminStatus: ["Listed_but_Unverified", "Listed_and_Verified"],
          createdAt: {
            [Op.between]: [
              new Date(`${start_date} T00:00:00Z`),
              new Date(`${end_date}T23:59:59Z`),
            ],
          },
        },
        include: [
          {
            model: Category,
            as: "category",
            attributes: {
              exclude: ["id", "image", "typeStatus", "createdAt", "updatedAt"],
            },
          },
          {
            model: WarehouseType,
            as: "type",
            attributes: {
              exclude: [
                "id",
                "image",
                "categoryStatus",
                "createdAt",
                "updatedAt",
              ],
            },
          },
        ],
        attributes: [
          "id",
          "warehouseName",
          "warehouseState",
          "warehouseContacts",
          "warehouseStorageSpaces",
          "warehouseImages",
          "createdAt",
          "updatedAt",
        ],
      });
      console.log("totalCount Page", totalCount);
      res.send(200, {
        warehouseRes: warehouseResponse,
        page: Math.ceil(totalCount.count / 10),
      });
    }
  } catch (err) {
    console.log("error checking", err);
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

/*Insert Warehouse Record*/

export const InsertWarehouseRecord = async (req, res) => {
  try {
    console.log("body checking.........", req.body);
    const body = req.body;
    if (Object.keys(body).length > 0) {
      const response = await WarehouseRecord.create(req.body);
      res.status(200).send({ warehouseRes: response });
    }
  } catch (err) {
    console.log("error Message Reason", err);
    res.status(500).send({ errorMessage: `${err} Internal Server Error` });
  }
};
