import express from "express";
import * as CustomerController from "../controllers/masterCustomerController.js";

const router = express.Router();

router.get("/", CustomerController.getCustomers);
router.post("/", CustomerController.createCustomer);
router.put("/:id", CustomerController.updateCustomer);
router.delete("/:id", CustomerController.deleteCustomer);

export default router;