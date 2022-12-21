if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { ApiError, Client, Environment } = require("square");

const config = {
  environment: Environment.Production,
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
