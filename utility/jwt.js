const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  // Set the expiration in hours (e.g., 96 hours for 4 days)
  const expirationInHours = 96;
  console.log(expirationInHours);
  const expirationTime = new Date(Date.now() + expirationInHours * 60 * 60 * 1000); // Convert hours to milliseconds

  const options = {
    expires: expirationTime,
    httpOnly: false,
    secure: true,
  };

  // Set the 'token' cookie with the token value and options
  res.cookie('token', token, options, {
    domain: 'localhost',
  });

  // Return the token as JSON in the response
  res.status(statusCode).json({
    success: true,
    login: user,
    token,
  });
};

module.exports = sendToken;
