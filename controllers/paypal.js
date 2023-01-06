const paypal = require("../utils/paypal-api");
const asyncError = require("../utils/AsyncError.js");
const mongoose = require("mongoose");
const sendEmail = require("../config/sendEmail");
const { v4: uuidv4 } = require("uuid");
const Order = require("../models/orders");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

exports.createOrder = asyncError(async (req, res) => {
  try {
    let sess = req.session;
    let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
    const total = cart.taxedTotal / 100;
    const order = await paypal.createOrder(total);
    res.send(order);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

exports.capture = asyncError(async (req, res) => {
  const { orderID } = req.params;
  let sess = req.session;
  let checkoutData =
    typeof sess.checkoutData !== "undefined" ? sess.checkoutData : false;
  let cart = typeof sess.cart !== "undefined" ? sess.cart : false;
  try {
    const captureData = await paypal.capturePayment(orderID);
    if (captureData.status === "COMPLETED") {
      let paymentId = [];
      const dataid = captureData.purchase_units;
      const id = dataid[0].payments.captures[0].id;
      paymentId.push(id);
      const status = captureData.status;
      const paymentSource = "PayPal Payment";
      const taxedTotal = cart.taxPrice / 100;
      const totalAmount = cart.taxedTotal / 100;
      const subtotal = cart.totals / 100;
      const user = req.user._id;
      const shipping = checkoutData.Shipping;
      const userEmail = req.user.email;
      const items = cart.items;
      orderDetails = {
        paymentId,
        paymentSource,
        status,
        taxedTotal,
        totalAmount,
        subtotal,
        user,
        shipping,
        item: items,
        userEmail,
      };
      const body = JSON.stringify(orderDetails);
      const url = process.env.CLIENT_URL;
      const success = await fetch(`${url}/createNewOrder`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });
      res.json({ captureData, url });
    } else {
      req.flash("error", "payment did not complete");
      res.redirect("/");
    }
  } catch (err) {
    req.flash("error", err);
    res.redirect("/");
  }
});

exports.thank_you = asyncError(async (req, res) => {
  let sess = req.session;
  let name;
  let email;
  let checkoutData =
    typeof sess.checkoutData !== "undefined" ? sess.checkoutData : false;
  if (req.user) {
    name = req.user.firstName;
    email = req.user.email;
  } else if (checkoutData.Shipping) {
    const shi = checkoutData.Shipping.firstname;
    name = shi;
    email = checkoutData.email;
  }
  let order = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(1);
  order = order[0];
  const orderNumber = order._id;
  const totalAmount = order.totalPrice;
  const itemPrice = order.itemsPrice;
  const taxPrice = order.taxPrice;
  const shippingPrice = order.shippingPrice;
  const address1 = order.shippingInfo.address;
  const address2 = order.shippingInfo.address2;
  const city = order.shippingInfo.city;
  const zip = order.shippingInfo.zip;
  const subject = "Thank You for your order at tarpit!";
  const message = "I hope you are having a good day~";
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
  Thank You for your order at tarpit!
  </div>
  
  <table border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
          <td align="center" style="background-color: #eeeeee;" bgcolor="#eeeeee">
          
          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;">
              <tr>
              <td align="center" valign="top" style="font-size:0; padding: 35px; background-color: #1d3167;"
                 
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
                                  Thank You For Your Order ${name}!
                              </h2>
                          </td>
                      </tr>
                      <tr>
                          <td align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding-top: 10px;">
                              <p style="font-size: 16px; font-weight: 400; line-height: 24px; color: #777777;">
                               Dear Valued Customer! We will start working on your order as soon as possible. You will be notified by email when the order is shipped or ready for pickup!
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
                                          ${orderNumber}
                                      </td>
                                  </tr>
                                  <tr>
                                      <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                          Purchased Item Price
                                      </td>
                                      <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                         $${itemPrice}
                                      </td>
                                  </tr>
                                  <tr>
                                      <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
                                          Shipping + Handling
                                      </td>
                                      <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
                                          $${shippingPrice}
                                      </td>
                                  </tr>
                                  <tr>
                                      <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
                                          Sales Tax
                                      </td>
                                      <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
                                          $${taxPrice}
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
                                          $${totalAmount}
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
                                              <p>${address1}<br>${address2}<br>${city}, ${zip}</p>
  
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
  checkoutData = " ";
  cart = " ";
  res.render("partials/thank_you", { name });
});

exports.paypalRefund = asyncError(async (req, res) => {
  const { orderId, orderNumber, totalAmount, taxPrice, itemPrice, email } =
    req.body;
  const refund = await paypal.refundPayPal(orderId);
  if (refund.status === "COMPLETED") {
    const order = await Order.findById(orderNumber);
    order.paymentInfo.status = "REFUNDED";
    order.orderStatus = "CANCELED";
    order.save();
    const subject = "Your refund is completed!";
    const message = "I hope you are having a good day~";
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
                                 Dear Valued Customer! We have completed the refund for the payment of your order. The amount should be back to your account in 2 to 3 bussiness days. Thank you once Again!
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
                                            ${orderNumber}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                            Purchased Item Price
                                        </td>
                                        <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 15px 10px 5px 10px;">
                                           $${itemPrice}
                                        </td>
                                    </tr>                          
                                    <tr>
                                        <td width="75%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
                                            Sales Tax
                                        </td>
                                        <td width="25%" align="left" style="font-family: Open Sans, Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; padding: 5px 10px;">
                                            $${taxPrice}
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
                                            $${totalAmount}
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
    </table> `;
    await sendEmail(email, subject, message, html);
    req.flash("success", "Order Refunded Successfully!");
    res.redirect("/dashboard");
  } else {
    req.flash("success", "Order did not refund!");
    res.redirect("/dashboard");
  }
});
// last
