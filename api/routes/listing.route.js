import express from "express";
import { createListing,deleteListing,updateListing,getListing } from "../controllers/listing.controller.js";
import { verifyToken } from "../utilities/verifyUser.js";
import { get } from "mongoose";

const router = express.Router();

router.post("/create", verifyToken, createListing);
router.delete("/delete/:id", verifyToken, deleteListing);
router.post("/update/:id", verifyToken, updateListing)
router.get("/getListing/:id", verifyToken, getListing)

export default router;
