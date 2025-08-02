// centralized error handling middleware

const errorHandling = (err, req, res, next) => {
  console.log(ërr.stack); // Log the error stack trace for debugging
  res.status(500).json({
    status: 500,
    message: "Some error occurred",
    error: err.message,
  }); // Send a JSON response with the error details
};

export default errorHandling;
