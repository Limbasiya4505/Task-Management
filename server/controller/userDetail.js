const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(req, res) {
  try {
    // Get the token from the request cookies or headers
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        message: 'Access denied. No token provided.',
        error: true,
      });
    }

    // Fetch user details using the token
    const user = await getUserDetailsFromToken(token);

    return res.status(200).json({
      message: "User details retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || error,
      error: true,
    });
  }
}

module.exports = userDetails;