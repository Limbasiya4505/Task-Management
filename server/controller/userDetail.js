const getUserDetailsFromToken = require("../helpers/getUserDetailsFromToken");

async function userDetails(req, res) {
    try {
        // Token handling removed
        // const token = req.cookies.token || "";

        // Assuming user details can be fetched without token
        const user = await getUserDetailsFromToken(); // Adjusted function call if needed

        return res.status(200).json({
            message: "user details",
            data: user
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}

module.exports = userDetails;