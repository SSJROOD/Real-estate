import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

mongoose
  .connect(process.env.MONGO)
  .then(() => {
    console.log("Connecected to MonGoDB");
  })
  .catch((err) => {
    console.log("Getting Error: ", err);
  });

const app = express();

app.listen(3000, () => {
  console.log("Server started on port 3000!!!");
});
