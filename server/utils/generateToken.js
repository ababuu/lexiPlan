const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  // user should contain at least id and orgId
  const payload = { id: user._id || user.id, orgId: user.orgId };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
};

module.exports = generateToken;
