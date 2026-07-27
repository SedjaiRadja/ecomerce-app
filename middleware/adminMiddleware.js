const adminMiddleware = (req, res, next) => {
  const { role } = req.user;
  if (role !== "admin") {
    return res.status(403).send("forbidden");
  }
  next();
};
module.exports = adminMiddleware;
