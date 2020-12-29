const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Users = require('../../models/Users');
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');

// @route GET api/auth
// @desc Test Route
// @access Public

router.get('/', auth, async (req, res) => {
  try {
    const user = await Users.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ msg: 'Server error' }).send();
  }
});

// @route POST api/auth
// @desc Authenticate User
// @access Public

router.post(
  '/',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password Is Required').exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if the user exists in the database

      let user = await Users.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      //Decrypt and check the password

      const match = await bcrypt.compare(
        password,
        user.password,
        (err, match) => {
          if (err) {
            return res
              .status(400)
              .json({ errors: [{ msg: 'Invalid Credentials' }] })
              .send();
          }
          const payload = {
            user: {
              id: user.id,
            },
          };

          // Generate the JWT token
          const token = jwt.sign(
            payload,
            config.jwtSecret,
            { expiresIn: 3600000 },
            (err, token) => {
              if (err) {
                throw err;
              }
              return res.send({ token });
            }
          );
        }
      );

      //   Return jsonwebtoken
    } catch (err) {
      console.log(err.stack);
      return res.status(500).send('Server Error');
    }
  }
);
module.exports = router;
