import jwt from "jsonwebtoken";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = null;
    if (authHeader && authHeader.startsWith("Bearer "))
      token = authHeader.split(" ")[1];

    // Support cookie-based token (HttpOnly cookie named 'token')
    if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

    if (!token)
      return res.status(401).json({ message: "Not authorized, token missing" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach useful fields
    req.userId = decoded.id || decoded.userId || null;
    req.orgId = decoded.orgId || null;
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
