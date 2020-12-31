const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const Post = require('../../models/Post');
const User = require('../../models/Users');
const Profile = require('../../models/Profile');
// @route GET api/posts
// @desc Test Route
// @access Public

router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json(errors.array());
    }
    try {
      const user = User.findById(req.user.id).select('-password');
      const new_post = new Post({
        text: req.body.text,
        name: user.name,
        user: req.user.id,
        avatar: user.avatar,
      });
      var post = await new_post.save();
      return res.json(post);
    } catch (err) {
      console.log(err.message);
      return res.status(500).text('Server Error');
    }
  }
);
// @route GET api/posts
// @desc Test Route
// @access Public

module.exports = router;
