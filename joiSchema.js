const BaseJoi = require("joi");
const sanitizeHtml = require("sanitize-html");

const extension = (joi) => ({
  type: "string",
  base: joi.string(),
  messages: {
    "string.escapeHTML": "{{#label}} must not include HTML!",
  },
  rules: {
    escapeHTML: {
      validate(value, helpers) {
        const clean = sanitizeHtml(value, {
          allowedTags: [],
          allowedAttributes: {},
        });
        if (clean !== value)
          return helpers.error("string.escapeHTML", { value });
        return clean;
      },
    },
  },
});

const joi = BaseJoi.extend(extension);
module.exports.productSchema = joi.object({
  product: joi
    .object({
      title: joi.string().required().escapeHTML(),
      price: joi.number().required().min(0),
      stock: joi.number().required().min(0),
      category: joi.allow().required(),
      description: joi.string().required().escapeHTML(),
    })
    .required(),
  deleteImage: joi.array(),
});

module.exports.reviewSchema = joi.object({
  review: joi
    .object({
      rating: joi.number().required().min(1).max(5),
      body: joi.string().required().escapeHTML(),
    })
    .required(),
});
module.exports.registerSchema = joi
  .object({
    firstName: joi.string().required().escapeHTML(),
    lastName: joi.string().required().escapeHTML(),
    email: joi
      .string()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
    username: joi.string().alphanum().min(3).max(30).required(),
    password: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
    password2: joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")),
  })
  .required();
