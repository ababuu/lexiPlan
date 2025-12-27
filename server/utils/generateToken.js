import jwt from "jsonwebtoken";

const generateToken = (user) => {
  const payload = { id: user._id || user.id, orgId: user.orgId };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export default generateToken;
