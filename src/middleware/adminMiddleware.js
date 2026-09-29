// Ensures only users with role "admin" can access the route.
// Must be used after the `protect` middleware, since it relies on req.user.
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = isAdmin;