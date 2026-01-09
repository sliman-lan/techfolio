const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @route   GET /api/users
// @desc    الحصول على جميع المستخدمين
// @access  Public
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ isProfilePublic: true })
      .select('name avatar bio skills certifications')
      .limit(20);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NOTE: place search route before the `/:id` route so it's not shadowed
// @route   GET /api/users/search
// @desc    البحث عن مستخدمين
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const users = await User.find({
      $and: [
        { isProfilePublic: true },
        {
          $or: [
            { name: { $regex: req.params.query, $options: 'i' } },
            { skills: { $regex: req.params.query, $options: 'i' } },
            { 'certifications.title': { $regex: req.params.query, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name avatar bio skills')
    .limit(10);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    الحصول على مستخدم معين
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // include email and createdAt; exclude password only
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user || !user.isProfilePublic) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/users/profile
// @desc    تحديث الملف الشخصي
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    console.log('PUT /api/users/profile called by user:', req.user?._id);
    console.log('Request body:', JSON.stringify(req.body));

    const user = await User.findById(req.user._id);
    console.log('User found:', !!user, 'userId:', user?._id);
    
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    // تحديث الحقول المسموح بها
    const allowedUpdates = [
      'name', 'bio', 'avatar', 'skills', 'certifications',
      'socialLinks', 'isProfilePublic'
    ];
    console.log('Allowed updates:', allowedUpdates);

    for (const update of allowedUpdates) {
      if (req.body[update] !== undefined) {
        console.log('Applying update:', update, 'valueType:', typeof req.body[update]);
        user[update] = req.body[update];
      }
    }

    console.log('About to save user. Current skills type:', Array.isArray(user.skills), 'skills:', user.skills);

    const updatedUser = await user.save();
    console.log('User saved successfully:', updatedUser._id);
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      bio: updatedUser.bio,
      avatar: updatedUser.avatar,
      skills: updatedUser.skills,
      certifications: updatedUser.certifications,
      socialLinks: updatedUser.socialLinks
    });
  } catch (error) {
    console.error('Error in PUT /api/users/profile:', error);
    const payload = { message: error.message, stack: error.stack };
    res.status(500).json(payload);
  }
});

module.exports = router;