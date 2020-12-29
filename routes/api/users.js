const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Users = require('../../models/Users');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
// @route GET api/user
// @desc Register User
// @access Public

router.post(
  '/',
  [
    check('name', 'The name cannot be empty').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter password with 6 or more charecters'
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log(req.body);

    const { name, email, password } = req.body;

    try {
      // Check if the user exists in the database

      let user = await Users.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      //Get Users gravitar
      const avatar = gravatar.url(email, { s: 200, r: 'pg', d: 'mm' });
      user = new Users({
        name,
        email,
        avatar,
        password,
      });

      //Encrypt the password

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      //Store the user in the database
      var resp = await user.save();
      const payload = {
        user: {
          id: resp.id,
        },
      };
      console.log(payload);
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

      //   Return jsonwebtoken
    } catch (err) {
      console.log(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
