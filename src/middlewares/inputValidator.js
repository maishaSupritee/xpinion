import Joi from "joi";

// define how our user inputs should look like
const userSchema = Joi.object({
  username: Joi.string().min(3).required(), // username should be a string with a minimum length of 3 characters and we cant have it blank (required)
  email: Joi.string().email().required(), // email should be a valid email format and we cant have it blank (required)
  password: Joi.string().min(8).required(), // password should be a string with a minimum length of 6 characters and we cant have it blank (required)
});

const validateUserInput = (req, res, next) => {
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

export default validateUserInput;
