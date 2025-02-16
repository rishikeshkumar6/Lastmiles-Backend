import { userModelSchema } from "./user.model.js";
import { Op } from "sequelize";

export const userRegisterSchema = async (req, res, next) => {
  try {
    if (Object.keys(req.body).length > 0) {
      const email = req.body.contactDetails.email;
      const phonenumber = req.body.contactDetails.phonenumber;
      const response = await userModelSchema.findOne({
        where: {
          [Op.or]: {
            "contactDetails.email": email,
            "contactDetails.phonenumber": phonenumber,
          },
        },
      });

      if (response !== null && Object.keys(response).length > 0) {
        return res.send(404, {
          errorMessage: "user email or phonenumber already exist",
        });
      } else if (response === null) {
        return next();
      }
      res.send(200, response);
    } else {
      console.log("user schema part is running");
      res.send(404, { errorMessage: "user not found" });
    }
  } catch (err) {
    console.log("catch part in running");
    res.send(500, { errorMessage: "Internal Server Error" });
  }
};

export const isStrongPassword = (value) => {
  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!regex.test(value)) {
    throw new Error(
      "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, one number, and one special character."
    );
  }
};
