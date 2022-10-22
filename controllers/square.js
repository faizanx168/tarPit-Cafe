const { createError, send } = require("micro");
const retry = require("async-retry");
const { v4: uuidv4 } = require("uuid");
const logger = require("../Square/logger");
const {
  validatePaymentPayload,
  validateCreateCardPayload,
} = require("../Square/schema");
// square provides the API client and error types
const { ApiError, client: square } = require("../Square/square");

exports.createPayment = async function (req, res) {
  const payload = await req.body;
  logger.debug("data: ", payload);
  await retry(async (bail, attempt) => {
    try {
      logger.debug("Creating payment", { attempt });
      const idempotencyKey = payload.idempotencyKey || uuidv4();
      const payment = {
        idempotencyKey,
        locationId: payload.locationId,
        sourceId: payload.sourceId,
        amountMoney: {
          amount: payload.price * 100,
          currency: "USD",
        },
      };
      if (payload.customerId) {
        payment.customerId = payload.customerId;
      }

      if (payload.verificationToken) {
        payment.verificationToken = payload.verificationToken;
      }

      const { result, statusCode } = await square.paymentsApi.createPayment(
        payment
      );

      logger.info("Payment succeeded!", { result, statusCode });

      send(res, statusCode, {
        success: true,
        payment: {
          id: result.payment.id,
          status: result.payment.status,
          receiptUrl: result.payment.receiptUrl,
          orderId: result.payment.orderId,
        },
      });
    } catch (ex) {
      if (ex instanceof ApiError) {
        // likely an error in the request. don't retry
        logger.error("erroe in", ex.errors);
        bail(ex);
      } else {
        logger.error(`Error creating payment on attempt ${attempt}: ${ex}`);
        throw ex; // to attempt retry
      }
    }
  });
};

exports.storeCard = async function (req, res) {
  const payload = await json(req);

  if (!validateCreateCardPayload(payload)) {
    throw createError(400, "Bad Request");
  }
  await retry(async (bail, attempt) => {
    try {
      logger.debug("Storing card", { attempt });

      const idempotencyKey = payload.idempotencyKey || uuidv4();
      const cardReq = {
        idempotencyKey,
        sourceId: payload.sourceId,
        card: {
          customerId: payload.customerId,
        },
      };

      if (payload.verificationToken) {
        cardReq.verificationToken = payload.verificationToken;
      }

      const { result, statusCode } = await square.cardsApi.createCard(cardReq);

      logger.info("Store Card succeeded!", { result, statusCode });

      // remove 64-bit value from response
      delete result.card.expMonth;
      delete result.card.expYear;

      send(res, statusCode, {
        success: true,
        card: result.card,
      });
    } catch (ex) {
      if (ex instanceof ApiError) {
        // likely an error in the request. don't retry
        logger.error(ex.errors);
        bail(ex);
      } else {
        // IDEA: send to error reporting service
        logger.error(
          `Error creating card-on-file on attempt ${attempt}: ${ex}`
        );
        throw ex; // to attempt retry
      }
    }
  });
};
