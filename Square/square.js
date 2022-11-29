if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { ApiError, Client, Environment } = require("square");

const { isProduction, SQUARE_ACCESS_TOKEN } = require("./config");

const config = {
  environment: Environment.Sandbox,
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
};
const {
  giftCardsApi,
  giftCardActivitiesApi,
  customersApi,
  ordersApi,
  paymentsApi,
  locationsApi,
  cardsApi,
  refundsApi,
} = new Client(config);

module.exports = {
  ApiError,
  giftCardsApi,
  giftCardActivitiesApi,
  customersApi,
  ordersApi,
  paymentsApi,
  locationsApi,
  cardsApi,
  refundsApi,
};
