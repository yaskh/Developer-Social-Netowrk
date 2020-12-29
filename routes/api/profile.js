const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const User = require('../../models/Users');
const Profile = require('../../models/Profile');

// @route GET api/profile/me
// @desc Test Route
// @access Public

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(400).json({ msg: 'There is no profile for this user' });
    } else res.json({ profile });
  } catch (err) {
    console.log(err);
    res.status(500).send('Server Error');
  }
});

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ err: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;
    const profileFields = {};
    // Setting up fields in profileFields object
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills)
      profileFields.skills = skills.split(',').map((skills) => skills.trim());

    profileFields.skills.social = {};
    if (youtube) profileFields.youtube = youtube;
    if (twitter) profileFields.twitter = twitter;
    if (facebook) profileFields.facebook = facebook;
    if (linkedin) profileFields.linkedin = linkedin;
    if (instagram) profileFields.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        // Profile exists we will update it
        console.log(profile);
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        return res.status(200).json(profile);
      }

      // Create a new profile
      profile = new Profile(profileFields);
      await profile.save();

      return res.status(200).json(profile);

      // Send back the profile
    } catch (err) {
      console.log(err.stack);
    }
    return res.status(200).send();
  }
);

// @route GET api/profile
// @desc GET all profiles
// @access Public
router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.send(profiles);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Server Error' });
  }
});

// @route GET api/profile
// @desc GET one profile
// @access Public
router.get('/user/:user_id', async (req, res) => {
  try {
    let profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.send({ msg: 'Profile not found' });
    }
    res.send(profile);
  } catch (error) {
    console.log(error);
    if (error.kind == 'ObjectId') {
      return res.send({ msg: 'Profile not found' });
    }
    return res.status(500).send({ error: 'Server Error' });
  }
});

// @route DELETE api/profile
// @desc DELETE one profile
// @access Private
router.delete('/', auth, async (req, res) => {
  try {
    console.log(
      await Profile.findOneAndDelete({
        user: req.user.id,
      })
    );
    console.log(
      await User.findOneAndDelete({
        _id: req.user.id,
      })
    );
    res.send('Profile Deleted');
  } catch (error) {
    console.log(error);
    if (error.kind == 'ObjectId') {
      return res.send({ msg: 'Profile not found' });
    }
    return res.status(500).send({ error: 'Server Error' });
  }
});
module.exports = router;
