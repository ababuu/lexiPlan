const Organization = require("../models/Organization");

// Requires `protect` to have run and set req.orgId
const requireActiveOrg = async (req, res, next) => {
  try {
    const orgId = req.orgId;
    if (!orgId)
      return res.status(400).json({ message: "Organization context missing" });

    const org = await Organization.findById(orgId).select("name isActive");
    if (!org)
      return res.status(404).json({ message: "Organization not found" });
    if (!org.isActive)
      return res.status(403).json({ message: "Organization suspended" });

    req.organization = org;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { requireActiveOrg };
