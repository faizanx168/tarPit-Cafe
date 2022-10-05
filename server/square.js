if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { ApiError, Client, Environment } = require("square");

const { isProduction, SQUARE_ACCESS_TOKEN } = require("./config");

const client = new Client({
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
});

module.exports = { ApiError, client };
