const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const { protect } = require('../middleware/auth');

// --- USER PERSONAL HUBS ---

// 1. User Profile Overview
router.get('/:username', async (req, res) => {
    try {
        const userProfile = await User.findOne({ username: req.params.username }).select('-password');
        if (!userProfile) return res.status(404).render('404', { title: 'User Not Found | CampusLost' });

        const itemCount = await Item.countDocuments({ reporter: userProfile._id });
        const claimCount = await Claim.countDocuments({ claimer: userProfile._id });

        res.render('user/profile', {
            title: `${userProfile.username} | CampusLost`,
            userProfile,
            itemCount,
            claimCount
        });
    } catch (err) {
        res.redirect('/items');
    }
});

// 2. User Personal Gallery (Reported Items)
router.get('/:username/items', async (req, res) => {
    try {
        const userProfile = await User.findOne({ username: req.params.username });
        if (!userProfile) return res.status(404).render('404', { title: 'User Not Found | CampusLost' });

        const items = await Item.find({ reporter: userProfile._id }).sort({ createdAt: -1 });
        
        res.render('user/items', {
            title: `${userProfile.username}'s Items | CampusLost`,
            userProfile,
            items
        });
    } catch (err) {
        res.redirect('/items');
    }
});

// 3. User Claims (Items they are trying to recover)
router.get('/:username/claims', protect, async (req, res) => {
    try {
        // Security: For now, users can only see their own claims list
        if (req.user.username !== req.params.username) {
            return res.redirect(`/${req.user.username}/claims`);
        }

        const claims = await Claim.find({ claimer: req.user.id })
            .populate('item')
            .sort({ createdAt: -1 });

        res.render('user/claims', {
            title: 'My Claims | CampusLost',
            userProfile: req.user,
            claims
        });
    } catch (err) {
        res.redirect('/items');
    }
});

module.exports = router;
