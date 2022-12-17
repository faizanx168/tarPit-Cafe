if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const method = require("method-override");
const Register = require("./routes/user.js");
const Tarpit = require("./routes/products");
const Reviews = require("./routes/reviews");
const myError = require("./utils/ExtendedError");
const passport = require("passport");
const localPass = require("passport-local");
const User = require("./models/user");
const About = require("./routes/about");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const favicon = require("serve-favicon");
const MongoDBStore = require("connect-mongodb-session")(session);
const Security = require("./utils/Security");
const bodyParser = require("body-parser");
const Cart = require("./routes/carts");
const SquarePayments = require("./routes/square");
const PaypalPayments = require("./routes/paypal");
const Blogs = require("./routes/blogs");
const Category = require("./routes/category");
const Orders = require("./routes/orderRoutes");
const helmet = require("helmet");
const connectDatabase = require("./config/database");
const home = require("./routes/home");
const mongoSanitize = require("express-mongo-sanitize");
require("./config/passport")(passport);

connectDatabase();

const store = new MongoDBStore({
  uri: process.env.DB_URI,
  collection: "sessions",
  databaseName: "tarpit",
  expires: 1000 * 60 * 60 * 24 * 10,
  touchAfter: 24 * 3600,
  connectionOptions: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(favicon(path.join(__dirname, "favicon.png")));
app.use(express.static(path.join(__dirname, "js")));
app.use(express.urlencoded({ extended: true }));
app.use(method("_method"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(mongoSanitize({ replaceWith: "_" }));

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: false,
  store: store,
  unset: "destroy",
  name: "Tarpit" + Security.generateId(),
  genid: (req) => {
    return Security.generateId();
  },
  cookie: {
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 5,
  },
};

app.use(session(sessionConfig));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(passport.authenticate("session"));
passport.use(new localPass(User.authenticate()));

app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.use("/", Register);
app.use("/categories", Category);
app.use("/about", About);
app.use("/products", Tarpit);
app.use("/", Cart);
app.use("/", SquarePayments);
app.use("/", PaypalPayments);
app.use("/blogs", Blogs);
app.use("/", Orders);
app.use("/products/:id/reviews", Reviews);
app.use("/", home);
app.all("*", (req, res, next) => {
  next(new myError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "Oh No, There was an error!!";
  res.status(status).render("error", { err });
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
