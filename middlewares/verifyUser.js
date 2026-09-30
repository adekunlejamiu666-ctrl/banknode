const jwt = require("jsonwebtoken");

const verifyUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({
        message: "No token provided"
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    res.status(401).send({
      message: "Invalid or expired token"
    });
  }
};

module.exports = verifyUser;