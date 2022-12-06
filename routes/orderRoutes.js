const express = require("express");
const {
  getSingleOrder,
  getAllOrders,
  updateOrder,
  getdashboard,
  getAllProducts,
  createNewOrder,
  allcategories,
  allBlogs,
  allemployees,
} = require("../controllers/orderRoutes");
const { isAdmin, isLoggedIn } = require("../utils/Middleware");
const router = express.Router();

router.get("/admin/products", isLoggedIn, isAdmin, getAllProducts);
router.get("/order/:id", isLoggedIn, getSingleOrder);
router.get("/dashboard", isLoggedIn, isAdmin, getdashboard);
router.get("/admin/orders", isLoggedIn, isAdmin, getAllOrders);
router.post("/admin/:id/updateOrder", isLoggedIn, isAdmin, updateOrder);
router.post("/createNewOrder", isLoggedIn, createNewOrder);

router.get("/admin/blogs", isLoggedIn, isAdmin, allBlogs);
router.get("/admin/categories", isLoggedIn, isAdmin, allcategories);
router.get("/admin/employees", isLoggedIn, isAdmin, allemployees);
// router
//   .route("/admin/order/:id")
//   .put(isAuthenticatedUser, authorizeRoles("admin"), updateOrder)
//   .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
