import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
export const ProductImage = async (req, res) => {
  try {
    console.log("request body", req.body, req.file);
    const uploadResult = await cloudinary.uploader.upload(req.file.path);
    console.log(uploadResult);
    fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
      else {
        console.log("file delete successfully");
      }
    });
    console.log("upload cloud image testing", uploadResult);
    res.status(200).send({ imageUrl: uploadResult.secure_url });
  } catch (err) {
    console.log("error", err);
    if (req.file?.path) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr)
          console.error(
            "Failed to delete file after error:",
            unlinkErr.message
          );
      });
    }
    return res
      .status(500)
      .json({ statusCode: 500, errorMessage: `${err} internal server error` });
  }
};
