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

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return res.json(posts);
  } catch (err) {
    console.log(err.message);
    return res.status(500).text('Server Error');
  }
});

// @route GET api/posts/:post_id
// @desc GET post by id
// @access Public

router.get('/:id', auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);

    if (!posts) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    return res.json(posts);
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route DELETE api/posts/:post_id
// @desc DELETE post by id
// @access Public

router.delete('/:id', auth, async (req, res) => {
  try {
    const posts = await Post.findById(req.params.id);

    if (!posts) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    if (req.user.id !== posts.user.toString()) {
      return res.status(401).send('Unauthorized to delete the post');
    }
    await posts.remove();

    return res.json({ msg: 'Post removed' });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});
module.exports = router;
