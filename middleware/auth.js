const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  console.log(req.body);
  if (!token) {
    return res.status(401).json({ msg: 'No token, Authorization failed' });
  }
  console.log('Here');
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));
    req.user = decoded.user;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ msg: 'Token is invalid' });
  }
};
