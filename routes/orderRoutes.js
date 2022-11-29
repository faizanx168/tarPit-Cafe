const express = require("express");
const {
  newOrder,
  getSingleOrder,
  myOrders,
  getAllOrders,
  updateOrder,
  deleteOrder,
  getdashboard,
  getAllProducts,
  createNewOrder,
} = require("../controllers/orderRoutes");
const router = express.Router();

router.get("/admin/products", getAllProducts);
router.get("/order/:id", getSingleOrder);
router.get("/dashboard", getdashboard);
router.get("/admin/orders", getAllOrders);
router.post("/admin/:id/updateOrder", updateOrder);
router.post("/createNewOrder", createNewOrder);
// router
//   .route("/admin/order/:id")
//   .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
//   .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
