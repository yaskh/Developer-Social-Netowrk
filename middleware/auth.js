const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, Authorization failed' });
  }

  try {
    jwt.verify(token, config.get('jwtSecret'), (error, decoded) => {
      if (!error) {
        req.user = decoded.user;
        next();
      } else {
        return res.status(401).json({ msg: 'Invalid token' });
      }
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ msg: 'Server Error' });
  }
};
