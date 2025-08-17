import Joi from "joi";

// define how our user inputs should look like
const userSchema = Joi.object({
  username: Joi.string().min(3).required(), // username should be a string with a minimum length of 3 characters and we cant have it blank (required)
  email: Joi.string().email().required(), // email should be a valid email format and we cant have it blank (required)
  // Add to your Joi schema
  role: Joi.string().valid("user", "admin").optional(), // only valid roles are 'user' or 'admin', defaults to 'user' if not provided
  password: Joi.string()
    .min(8)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
    }), // Regex to ensure password contains at least one lowercase letter, one uppercase letter, one number, and one special character
});

const gameSchema = Joi.object({
  title: Joi.string().min(1).required(), // title should be a string with a minimum length of 1 character and we cant have it blank (required)
  genre: Joi.string().max(100).optional(), // genre should be a string with a max length of 100 characters and we cant have it blank (required)
  description: Joi.string().max(1000).optional().allow(""), // description is optional and can be an empty string
  developer: Joi.string().max(255).optional().allow(""), // developer is optional and can be an empty string
  release_date: Joi.date().optional(), // releaseDate is optional and should be a valid date
  publisher: Joi.string().max(255).optional().allow(""), // publisher is optional
  platform: Joi.string().max(100).optional().allow(""), // platform is optional and can be an empty string,
  image_url: Joi.string().uri().optional().allow(""), // image_url is optional and should be a valid URI
});

const reviewSchema = Joi.object({
  title: Joi.string().min(3).max(255).required(), // title should be a string with a minimum length of 3 characters, max 255, and we cant have it blank (required)
  content: Joi.string().optional(), // content is optional and can be an empty string
  rating: Joi.number().min(1).max(5).required(), // rating should be a number between 1 and 5 and we cant have it blank (required)
  user_id: Joi.number().integer(), // user_id should be an integer and we cant have it blank (required)
  game_id: Joi.number().integer().required(), // game_id should be an integer and we cant have it blank (required)
});

export const validateUserInput = (req, res, next) => {
  const { error } = userSchema.validate(req.body); // validate the request body against the schema
  if (error) {
    return res.status(400).json({
      // if validation fails, send a 400 Bad Request response with the error message
      status: 400,
      message: error.details[0].message,
    });
  }
  next(); // if validation passes, proceed to the next middleware or route handler
};

export const validateGameInput = (req, res, next) => {
  const { error } = gameSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.details[0].message,
    });
  }
  next();
};

export const validateReviewInput = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.details[0].message,
    });
  }
  next();
};
