const Order = require("../models/orders");
const Product = require("../models/Product");
const ErrorHander = require("../utils/ErrorHandler");
const asyncError = require("../utils/AsyncError");
const Address = require("../models/address");
const { giftCardsApi, giftCardActivitiesApi } = require("../Square/square");
const sendEmail = require("../config/sendEmail");
const { v4: uuidv4 } = require("uuid");

// get Single Order
exports.getSingleOrder = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "username email"
  );
  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }
  // console.log(order);
  res.render("order/showOrder", { order });
});

exports.getdashboard = asyncError(async (req, res) => {
  let dateStart = new Date();
  if (req.query.date) {
    const date = req.query.date;
    console.log(date);
    const myarray = date.split("-");
    console.log(myarray);
    const year = myarray[0];
    const month = myarray[1];
    const day = myarray[2];
    dateStart.setUTCFullYear(parseInt(year, 10));
    dateStart.setUTCMonth(parseInt(month, 10) - 1);
    dateStart.setUTCDate(parseInt(day, 10));
    dateStart.setUTCHours(0, 0, 0);
  } else {
    const [month, day, year] = [
      dateStart.getMonth(),
      dateStart.getDate(),
      dateStart.getFullYear(),
    ];
    dateStart.setUTCFullYear(parseInt(year, 10));
    dateStart.setUTCMonth(parseInt(month, 10));
    dateStart.setUTCDate(parseInt(day, 10));

    dateStart.setUTCHours(0, 0, 0);
  }
  const dateMax = new Date();

  dateMax.setUTCHours(23, 59, 59);

  recentOrders = await Order.find({
    createdAt: {
      $gte: dateStart,
      $lte: dateMax,
    },
  })
    .sort({ createdAt: -1 })
    .select("paymentInfo createdAt orderStatus totalPrice itemsPrice user")
    .populate("user", "username");
  let format = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  let totalSales = 0;
  let totalOrders = 0;
  let totalIncome = 0;
  recentOrders.forEach((order, i) => {
    totalSales += order.totalPrice;
    totalIncome += order.itemsPrice;
    totalOrders += i;
  });
  totalSales = format.format(totalSales);
  totalIncome = format.format(totalIncome);

  res.render("dashboard/dashboard", {
    recentOrders,
    totalSales,
    totalIncome,
    totalOrders: totalOrders + 1,
    classes: "setdashboard",
  });
});
// get all Orders -- Admin
exports.getAllOrders = asyncError(async (req, res, next) => {
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .select("paymentInfo createdAt orderStatus totalPrice user");
  // .populate("user", "username");

  res.render("dashboard/allOrders", {
    success: true,
    orders,
    classes: "orders",
  });
});
// get All products
exports.getAllProducts = asyncError(async (req, res) => {
  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .select("title  price stock category ratings")
    .populate("category", "name")
    .limit(1);
  // res.send(products);
  res.render("dashboard/allproducts", {
    success: true,
    products,
    classes: "products",
  });
});

// update Order Status -- Admin
exports.updateOrder = asyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  const tracking = req.body.tracking;
  const email = order.userEmail;
  if (!order) {
    return next(new ErrorHander("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHander("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    const subject = "Thank You for your order at tarpit!";
    const message = "Hi";
    const html = `<style type="text/css">

  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; }
  
  img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  table { border-collapse: collapse !important; }
  body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
  
  
  a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
  }
  
  @media screen and (max-width: 480px) {
      .mobile-hide {
          display: none !important;
      }
      .mobile-center {
          text-align: center !important;
      }
  }
  div[style*="margin: 16px 0;"] { margin: 0 !important; }
  </style>
  <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
  
  
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
  Hi ${order.shippingInfo.firstname}, your order has been shippied!
  </div>
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
          <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
              <tr>
              <td align="center" valign="top" style="font-size:0; padding: 35px; background-color: #1d3167;" >
                 
                  <div style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                          <tr>
                              <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 48px;" class="mobile-center">
                                  <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: #ffffff;">Tarpit Coffee</h1>
                              </td>
                          </tr>
                      </table>
                  </div>
                  
                  <div style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;" class="mobile-hide">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                          <tr>
                              <td align="right" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; line-height: 48px;">
                                  <table cellspacing="0" cellpadding="0" border="0" align="right">
                                      <tr>
                                          <td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400;">
                                              <p style="font-size: 18px; font-weight: 400; margin: 0; color: #ffffff;"><a href="#" target="_blank" style="color: #ffffff; text-decoration: none;">Shop &nbsp;</a></p>
                                          </td>
                                          <td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 24px;">
                                              <a href="https://www.tarpitcoffee.com/" target="_blank" style="color: #ffffff; text-decoration: none;"><img src="https://img.icons8.com/color/48/000000/small-business.png" width="27" height="23" style="display: block; border: 0px;"/></a>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </div>
                
                  </td>
              </tr>
              <tr>
                  <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                      <tr>
                          <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                              <img src="https://img.icons8.com/carbon-copy/100/000000/checked-checkbox.png" width="125" height="120" style="display: block; border: 0px;" /><br>
                              <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                                  Thank You For supporting our small business! 
                              </h2>
                          </td>
                      </tr>
                      <tr>
                          <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                              <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                               Dear ${order.shippingInfo.firstname}! We have shipped your order or amount $${order.totalPrice}. If you would like to track your order, you can use the following tracking number: <b>${tracking}</b>.
                               Don't forget to recommend our small business to your friends and family members!
                              </p>
                          </td>
                      </tr>
                      <tr>
                          <td align="left" style="padding-top: 20px;">
                              <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                      <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                          Order Confirmation #
                                      </td>
                                      <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                          ${order._id}
                                      </td>
                                  </tr>
                                  <tr>
                                      <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                         Order Total
                                      </td>
                                      <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                         $${order.totalPrice}
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  </td>
              </tr>
               <tr>
                  <td align="center" height="100%" valign="top" width="100%" style="padding: 0 35px 35px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;">
                      <tr>
                          <td align="center" valign="top" style="font-size:0;">
                              <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">
  
                                  <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                                      <tr>
                                          <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
                                              <p style="font-weight: 800;">Delivery Address</p>
                                              <p>${order.address}<br>${order.address2}<br>${order.city}, ${order.zip}</p>
  
                                          </td>
                                      </tr>
                                  </table>
                              </div>
                          </td>
                      </tr>
                  </table>
                  </td>
              </tr>
              <tr>
              <td align="center" style=" padding: 35px; background-color: #1d3167a3;" bgcolor="#1b9ba3">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                      <tr>
                          <td align="center" style="padding: 25px 0 15px 0;">
                              <table border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                      <td align="center" style="border-radius: 5px;" bgcolor="#66b3b7">
                                        <a href="https://www.tarpitcoffee.com/products" target="_blank" style="font-size: 18px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; background-color: #F44336; padding: 15px 30px; border: 1px solid #F44336; display: block;">Shop Again</a>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  </td>
              </tr>
              <tr>
                  <td align="center" style="padding: 35px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                      <tr>
                          <td align="center">
                              <img src="https://res.cloudinary.com/dvpbsy8id/image/upload/v1664134178/tarpitCafe/tarpit_long_whiteTrans_600_msqiqa.png" width="37" height="37" style="display: block; border: 0px;"/>
                          </td>
                      </tr>
                      <tr>
                          <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;">
                              <p style="font-size: 14px; font-weight: 800; line-height: 18px; color: #333333;">
                                  135 Woodpoint Rd.<br>
                                  Brooklyn, NY 11211
                              </p>
                          </td>
                      </tr>
                      <tr>
                          <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;">
                              <p style="font-size: 14px; font-weight: 400; line-height: 20px; color: #777777;">
                                  If you have any questions let us know on this Number # +1 917 705 8031 .
                              </p>
                          </td>
                      </tr>
                  </table>
                  </td>
              </tr>
          </table>
          </td>
      </tr>
  </table> `;
    await sendEmail(email, subject, message, html);
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
    const subject = "Thank You for your order at tarpit!";
    const message = "Hi";
    const html = `<style type="text/css">

  body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  img { -ms-interpolation-mode: bicubic; }
  
  img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
  table { border-collapse: collapse !important; }
  body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
  
  
  a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
  }
  
  @media screen and (max-width: 480px) {
      .mobile-hide {
          display: none !important;
      }
      .mobile-center {
          text-align: center !important;
      }
  }
  div[style*="margin: 16px 0;"] { margin: 0 !important; }
  </style>
  <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
  
  
  <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
  Hi ${order.shippingInfo.firstname}, your order has been delivered!
  </div>
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
          <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
              <tr>
              <td align="center" valign="top" style="font-size:0; padding: 35px; background-color: #1d3167;" >
                 
                  <div style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                          <tr>
                              <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 48px;" class="mobile-center">
                                  <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: #ffffff;">Tarpit Coffee</h1>
                              </td>
                          </tr>
                      </table>
                  </div>
                  
                  <div style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;" class="mobile-hide">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                          <tr>
                              <td align="right" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; line-height: 48px;">
                                  <table cellspacing="0" cellpadding="0" border="0" align="right">
                                      <tr>
                                          <td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400;">
                                              <p style="font-size: 18px; font-weight: 400; margin: 0; color: #ffffff;"><a href="#" target="_blank" style="color: #ffffff; text-decoration: none;">Shop &nbsp;</a></p>
                                          </td>
                                          <td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 24px;">
                                              <a href="https://www.tarpitcoffee.com/" target="_blank" style="color: #ffffff; text-decoration: none;"><img src="https://img.icons8.com/color/48/000000/small-business.png" width="27" height="23" style="display: block; border: 0px;"/></a>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </div>
                
                  </td>
              </tr>
              <tr>
                  <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                      <tr>
                          <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                              <img src="https://img.icons8.com/carbon-copy/100/000000/checked-checkbox.png" width="125" height="120" style="display: block; border: 0px;" /><br>
                              <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                                  Thank You For supporting our small business! 
                              </h2>
                          </td>
                      </tr>
                      <tr>
                          <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                              <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                               Dear ${order.shippingInfo.firstname}! Your order with the following order number: <b>${order._id}</b> and the following tracking number: <b>${tracking}</b>
                               has been delivered. Once again, thank you for your support and feel free to rate our products at <a href= '${process.env.CLIENT_URL}/products'>tarpit Coffee</a>.  
                               Don't forget to recommend our small business to your friends and family members! Thank you
                              </p>
                          </td>
                      </tr>
                      <tr>
                          <td align="left" style="padding-top: 20px;">
                              <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                      <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                          Order Confirmation #
                                      </td>
                                      <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                          ${order._id}
                                      </td>
                                  </tr>
                                  <tr>
                                      <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                         Order Total
                                      </td>
                                      <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                         $${order.totalPrice}
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  </td>
              </tr>
               <tr>
                  <td align="center" height="100%" valign="top" width="100%" style="padding: 0 35px 35px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:660px;">
                      <tr>
                          <td align="center" valign="top" style="font-size:0;">
                              <div style="display:inline-block; max-width:50%; min-width:240px; vertical-align:top; width:100%;">
  
                                  <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                                      <tr>
                                          <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px;">
                                              <p style="font-weight: 800;">Delivery Address</p>
                                              <p>${order.address}<br>${order.address2}<br>${order.city}, ${order.zip}</p>
  
                                          </td>
                                      </tr>
                                  </table>
                              </div>
                          </td>
                      </tr>
                  </table>
                  </td>
              </tr>
              <tr>
              <td align="center" style=" padding: 35px; background-color: #1d3167a3;" bgcolor="#1b9ba3">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                      <tr>
                          <td align="center" style="padding: 25px 0 15px 0;">
                              <table border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                      <td align="center" style="border-radius: 5px;" bgcolor="#66b3b7">
                                        <a href="https://www.tarpitcoffee.com/products" target="_blank" style="font-size: 18px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; background-color: #F44336; padding: 15px 30px; border: 1px solid #F44336; display: block;">Shop Again</a>
                                      </td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                  </table>
                  </td>
              </tr>
              <tr>
                  <td align="center" style="padding: 35px; background-color: #ffffff;" bgcolor="#ffffff">
                  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                      <tr>
                          <td align="center">
                              <img src="https://res.cloudinary.com/dvpbsy8id/image/upload/v1664134178/tarpitCafe/tarpit_long_whiteTrans_600_msqiqa.png" width="37" height="37" style="display: block; border: 0px;"/>
                          </td>
                      </tr>
                      <tr>
                          <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;">
                              <p style="font-size: 14px; font-weight: 800; line-height: 18px; color: #333333;">
                                  135 Woodpoint Rd.<br>
                                  Brooklyn, NY 11211
                              </p>
                          </td>
                      </tr>
                      <tr>
                          <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;">
                              <p style="font-size: 14px; font-weight: 400; line-height: 20px; color: #777777;">
                                  If you have any questions let us know on this Number # +1 917 705 8031 .
                              </p>
                          </td>
                      </tr>
                  </table>
                  </td>
              </tr>
          </table>
          </td>
      </tr>
  </table> `;
    await sendEmail(email, subject, message, html);
  }
  await order.save({ validateBeforeSave: false });
  req.flash("success", "Order Status Changed Successfully");
  res.redirect("/dashboard");
});

exports.createNewOrder = asyncError(async (req, res) => {
  try {
    let orderDetails = req.body;
    const item = orderDetails.item;
    const createdAt = new Date().toJSON();
    const order = new Order({
      userEmail: orderDetails.userEmail,
      shippingInfo: orderDetails.shipping,
      orderItems: item,
      user: orderDetails.user,
      paymentInfo: {
        id: orderDetails.paymentId,
        source: orderDetails.paymentSource,
        status: orderDetails.status,
      },
      paidAt: createdAt,
      itemsPrice: orderDetails.subtotal,
      taxPrice: orderDetails.taxedTotal,
      shippingPrice: 0,
      totalPrice: orderDetails.totalAmount,
      orderStatus: "Processing",
      createdAt: createdAt,
    });
    await item.forEach(async (it) => {
      if (it.id === process.env.GIFTCARD) {
        // Create a pending gift card.
        const giftCardRequest = generateGiftCardRequest();
        const {
          result: { giftCard },
        } = await giftCardsApi.createGiftCard(giftCardRequest);
        const giftcard_gan = giftCard.gan;
        const giftCardAmount = it.price;
        const giftItemId = it.id;
        // Now link it to the customer logged in!
        // await giftCardsApi.linkCustomerToGiftCard(giftCard.id, { customerId });
        // console.log("giftcard Created:", giftCard);

        const GiftCardActivity = generateGiftCardActivity(
          giftcard_gan,
          giftCardAmount,
          giftItemId,
          orderDetails.paymentId
        );
        const giftcard_response =
          await giftCardActivitiesApi.createGiftCardActivity(GiftCardActivity);
        const email = orderDetails.userEmail;
        const subject = "Tarpit Coffee Gift Card!";
        const message = "I hope you are having a good day~";
        const html = `
        <style type="text/css">

        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        
        
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
        
        @media screen and (max-width: 480px) {
            .mobile-hide {
                display: none !important;
            }
            .mobile-center {
                text-align: center !important;
            }
        }
        div[style*="margin: 16px 0;"] { margin: 0 !important; }
        </style>
        <body style="margin: 0 !important; padding: 0 !important; background-color: #eeeeee;" bgcolor="#eeeeee">
        
        
        <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Open Sans, Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
        Thank You for your order at tarpit!
        </div>
        
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
                <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
                
                <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                    <tr>
                        <td align="center" valign="top" style="font-size:0; padding: 35px; background-color: #1d3167;" >
                       
                        <div style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                                <tr>
                                    <td align="left" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 36px; font-weight: 800; line-height: 48px;" class="mobile-center">
                                        <h1 style="font-size: 36px; font-weight: 800; margin: 0; color: #ffffff;">Tarpit Coffee</h1>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="display:inline-block; max-width:50%; min-width:100px; vertical-align:top; width:100%;" class="mobile-hide">
                            <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:300px;">
                                <tr>
                                    <td align="right" valign="top" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; line-height: 48px;">
                                        <table cellspacing="0" cellpadding="0" border="0" align="right">
                                            <tr>
                                                <td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400;">
                                                    <p style="font-size: 18px; font-weight: 400; margin: 0; color: #ffffff;"><a href="#" target="_blank" style="color: #ffffff; text-decoration: none;">Shop &nbsp;</a></p>
                                                </td>
                                                <td style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 24px;">
                                                    <a href="https://www.tarpitcoffee.com/" target="_blank" style="color: #ffffff; text-decoration: none;"><img src="https://img.icons8.com/color/48/000000/small-business.png" width="27" height="23" style="display: block; border: 0px;"/></a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </div>
                      
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 35px 35px 20px 35px; background-color: #ffffff;" bgcolor="#ffffff">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                            <tr>
                                <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 25px;">
                                    <img src="https://img.icons8.com/carbon-copy/100/000000/checked-checkbox.png" width="125" height="120" style="display: block; border: 0px;" /><br>
                                    <h2 style="font-size: 30px; font-weight: 800; line-height: 36px; color: #333333; margin: 0;">
                                        Thank You For Shopping with us! Hope you make another Purchase
                                    </h2>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                                    <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                                     Dear Valued Customer! Your giftcard has been set with an amount of $${giftCardAmount}. To use the gift card use the following giftcard number: <b>${giftcard_gan}</b>. Enjoy!!
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" style="padding-top: 20px;">
                                    <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td width="75%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                               Giftcard Numebr#
                                            </td>
                                            <td width="25%" align="left" bgcolor="#eeeeee" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px;">
                                                ${giftcard_gan}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                                Purchased Item Price
                                            </td>
                                            <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                               $${giftCardAmount}
                                            </td>
                                        </tr>                          
                                        <tr>
                                            <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
                                                Sales Tax
                                            </td>
                                            <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
                                                $${0}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" style="padding-top: 20px;">
                                    <table cellspacing="0" cellpadding="0" border="0" width="100%">
                                        <tr>
                                            <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                                                TOTAL
                                            </td>
                                            <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 800; line-height: 24px; padding: 10px; border-top: 3px solid #eeeeee; border-bottom: 3px solid #eeeeee;">
                                                $${giftCardAmount}
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style=" padding: 35px; background-color: #1d3167a3;" bgcolor="#1b9ba3">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                            <tr>
                                <td align="center" style="padding: 25px 0 15px 0;">
                                    <table border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                            <td align="center" style="border-radius: 5px;" bgcolor="#66b3b7">
                                              <a href="https://www.tarpitcoffee.com/products" target="_blank" style="font-size: 18px; font-family: Open Sans, Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 5px; background-color: #F44336; padding: 15px 30px; border: 1px solid #F44336; display: block;">Shop Again</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 35px; background-color: #ffffff;" bgcolor="#ffffff">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
                            <tr>
                                <td align="center">
                                    <img src="https://res.cloudinary.com/dvpbsy8id/image/upload/v1664134178/tarpitCafe/tarpit_long_whiteTrans_600_msqiqa.png" width="37" height="37" style="display: block; border: 0px;"/>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px; padding: 5px 0 10px 0;">
                                    <p style="font-size: 14px; font-weight: 800; line-height: 18px; color: #333333;">
                                        135 Woodpoint Rd.<br>
                                        Brooklyn, NY 11211
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 24px;">
                                    <p style="font-size: 14px; font-weight: 400; line-height: 20px; color: #777777;">
                                        If you have any questions let us know on this Number # +1 917 705 8031 .
                                    </p>
                                </td>
                            </tr>
                        </table>
                        </td>
                    </tr>
                </table>
                </td>
            </tr>
        </table> 
       `;
        await sendEmail(email, subject, message, html);
      } else {
        const product = await Product.findById(it.id);
        product.stock -= it.qty;
        await product.save({ validateBeforeSave: false });
      }
    });
    await order.save();
    res.status(200).json({
      success: true,
      order,
    });
  } catch (err) {
    console.log(err);
  }
});

function generateGiftCardRequest() {
  return {
    idempotencyKey: uuidv4(),
    locationId: process.env.LocationID,
    giftCard: {
      type: "DIGITAL",
    },
  };
}

function generateGiftCardActivity(gan, amount, id, paymentId) {
  return {
    idempotencyKey: uuidv4(),
    giftCardActivity: {
      type: "ACTIVATE",
      locationId: process.env.LocationID,
      giftCardGan: gan,
      activateActivityDetails: {
        amountMoney: {
          amount: amount * 100,
          currency: "USD",
        },
        referenceId: id,
        buyerPaymentInstrumentIds: paymentId,
      },
    },
  };
}
