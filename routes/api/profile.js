const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const requests = require('request');
const config = require('config');

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

// @route PUT api/profile/experience
// @desc ADDS profile Experience
// @access Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('company', 'Company is required').not().isEmpty(),
      check('from', 'from date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      profile.save();
      res.send(profile);
    } catch (err) {
      console.error(err.stack);
      return res.status(500).send('Server error!');
    }
  }
);

// @route DELETE api/profile/experience/:exp_id
// @desc Delete profile Experience
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    console.log('here');
    const profile = await Profile.findOne({ user: req.user.id });

    let removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();
    return res.status(200).json(profile);

    exp_id = req.params.exp_id;
  } catch (err) {
    console.log(err.stack);
    res.status(500).send('Server Error');
  }
});

// @route PUT api/profile/Education
// @desc ADDS profile Education
// @access Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required').not().isEmpty(),
      check('degree', 'Degree is required').not().isEmpty(),
      check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
      check('from', 'from date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      profile.save();
      res.send(profile);
    } catch (err) {
      console.error(err.stack);
      return res.status(500).send('Server error!');
    }
  }
);

// @route DELETE api/profile/education/:exp_id
// @desc Delete Education from profile
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    console.log('here');
    const profile = await Profile.findOne({ user: req.user.id });

    let removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();
    return res.status(200).json(profile);

    exp_id = req.params.exp_id;
  } catch (err) {
    console.log(err.stack);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public

router.get('/github/:username', async (req, res) => {
  try {
    const options = {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.githubClientID}&client_secret${config.githubClientSecret}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' },
    };
    requests(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode != 200) {
        return res.send(404).json({ msg: 'No github Profile' });
      }
      return res.json(JSON.parse(body));
    });
  } catch (err) {
    console.log(err.message);
    console.log(err.stack);
    return res.status(500).json('Server Error');
  }
});

module.exports = router;
