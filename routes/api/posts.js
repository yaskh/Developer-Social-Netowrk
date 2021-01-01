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
      return res.status(500).send('Server Error');
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

// @route POST api/posts/like/:id
// @desc Like a post
// @access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check if the post has already been liked by the current user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    return res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route POST api/posts/unlike/:id
// @desc Like a post
// @access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    // Check if the post has already been liked by the current user
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length == 0
    ) {
      return res.status(400).json({ msg: 'Post not liked' });
    }
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    return res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    return res.status(500).send('Server Error');
  }
});

// @route GET api/posts
// @desc Test Route
// @access Public

router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors);
      return res.status(400).json(errors.array());
    }
    try {
      const user = User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        user: req.user.id,
        avatar: user.avatar,
      };
      post.comments.unshift(newComment);
      await post.save();

      return res.json(post);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

// @route GET api/posts
// @desc Test Route
// @access Public

router.delete(
  '/comment/:id/:comment_id',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (req, res) => {
    try {
      // Get all the comments from the database

      const post = await Post.findById(req.params.id);

      // Finding the comment that needs to be deleted

      const comment = post.comments.find(
        (comment) => comment.id === req.params.comment_id
      );
      if (!comment) {
        return res.status(404).json({ msg: 'Comment not found' });
      }
      if (comment.user.toString() !== req.user.id) {
        return res.status(401).json({ msg: 'User not authorized' });
      }

      // Converting id to string.
      // Then executing the indexOf function
      const removeIndex = post.comments
        .map((comment) => comment.user.toString())
        .indexOf(req.user.id);

      post.comments.splice(removeIndex, 1);
      console.log(await post.save());
      res.json(post);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send('Server Error');
    }
  }
);

module.exports = router;
