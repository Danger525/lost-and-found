const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Item = require('../models/Item');
const { protect } = require('../middleware/auth');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb('Error: Images Only!');
    }
});

// Report Item Page
router.get('/items/report', protect, (req, res) => {
    res.render('report', { title: 'Report Item | CampusLost' });
});

// Submit Report Logic
router.post('/items/report', protect, upload.single('image'), async (req, res) => {
    const { title, description, category, location, itemType } = req.body;
    
    // Image Validation
    if (!req.file) {
        req.flash('error_msg', 'Please upload an image of the item.');
        return res.redirect('/items/report');
    }

    try {
        const newItem = new Item({
            title,
            description,
            category,
            location,
            itemType,
            imageUrl: `/uploads/${req.file.filename}`,
            reporter: req.user.id
        });
        await newItem.save();
        req.flash('success_msg', 'Item reported successfully!');
        res.redirect('/items');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error reporting item');
        res.redirect('/items/report');
    }
});

// View All Items (Public)
router.get('/items', async (req, res) => {
    const { category, type, q } = req.query;
    let query = { status: 'open' };
    
    if (category) query.category = category;
    if (type) query.itemType = type;
    if (q) query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
    ];

    try {
        const items = await Item.find(query).sort({ createdAt: -1 });
        res.render('items', { 
            title: 'Browse Items | CampusLost', 
            items,
            filters: { category, type, q }
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// Item Detail Page
router.get('/items/:id', async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('reporter', 'username');
        if (!item) return res.redirect('/items');
        res.render('item-detail', { title: `${item.title} | CampusLost`, item });
    } catch (err) {
        console.error(err);
        res.redirect('/items');
    }
});

// Submit Claim Logic
router.post('/items/:id/claim', protect, async (req, res) => {
    const { description, contactDetails } = req.body;
    try {
        const Claim = require('../models/Claim');
        const newClaim = new Claim({
            item: req.params.id,
            claimer: req.user.id,
            description,
            contactDetails
        });
        await newClaim.save();
        req.flash('success_msg', 'Claim submitted! The reporter will review it.');
        res.redirect('/items/' + req.params.id);
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error submitting claim');
        res.redirect('/items/' + req.params.id);
    }
});

module.exports = router;
