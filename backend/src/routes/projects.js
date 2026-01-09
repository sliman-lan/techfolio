const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const Project = require('../models/Project');
const { protect } = require('../middleware/auth');

// multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-\_]/g, '_');
    cb(null, `${unique}-${safeName}`);
  }
});

const upload = multer({ storage });

// @route   GET /api/projects
// @desc    الحصول على جميع المشاريع
// @access  Public
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ isPublic: true })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    الحصول على مشروع معين
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('userId', 'name avatar email')
      .populate('ratings.userId', 'name');
    
    if (!project || !project.isPublic) {
      return res.status(404).json({ message: 'المشروع غير موجود' });
    }
    
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects
// @desc    إنشاء مشروع جديد (يدعم رفع صور)
// @access  Private
router.post('/', protect, upload.array('images', 6), async (req, res) => {
  try {
    const body = req.body || {};

    const project = new Project({
      title: body.title,
      description: body.description,
      shortDescription: body.shortDescription,
      category: body.category || 'web',
      demoUrl: body.demoUrl,
      githubUrl: body.githubUrl,
      userId: req.user._id
    });

    // attach uploaded images as absolute URLs
    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      project.images = req.files.map(f => `${baseUrl}/uploads/${f.filename}`);
    }

    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    تحديث مشروع
// @access  Private
router.put('/:id', protect, upload.array('images', 6), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'المشروع غير موجود' });
    }

    // التحقق من ملكية المشروع
    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لتعديل هذا المشروع' });
    }

    Object.assign(project, req.body);

    if (req.files && req.files.length > 0) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      // append new images
      project.images = project.images.concat(req.files.map(f => `${baseUrl}/uploads/${f.filename}`));
    }

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    حذف مشروع
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'المشروع غير موجود' });
    }

    if (project.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'ليس لديك صلاحية لحذف هذا المشروع' });
    }

    await project.remove();
    res.json({ message: 'تم حذف المشروع بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/projects/:id/rate
// @desc    إضافة تقييم لمشروع
// @access  Private
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project || !project.isPublic) {
      return res.status(404).json({ message: 'المشروع غير موجود' });
    }

    // التحقق إذا كان المستخدم قد قام بالتقييم مسبقاً
    const existingRating = project.ratings.find(
      rating => rating.userId.toString() === req.user._id.toString()
    );

    if (existingRating) {
      return res.status(400).json({ message: 'لقد قمت بتقييم هذا المشروع مسبقاً' });
    }

    // إضافة التقييم الجديد
    project.ratings.push({
      userId: req.user._id,
      value: req.body.value,
      comment: req.body.comment
    });

    // حساب التقييم المتوسط
    project.calculateAverageRating();
    await project.save();

    res.json({ 
      message: 'تم إضافة التقييم بنجاح',
      project 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;