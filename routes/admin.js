const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Helper to fetch global stats
const getStats = async () => {
    return {
        userCount: await User.countDocuments(),
        itemCount: await Item.countDocuments(),
        claimCount: await Claim.countDocuments()
    };
};

// 1. Admin Dashboard Overview
router.get('/admin', protect, adminOnly, async (req, res) => {
    res.redirect('/admin/dashboard');
});

// Legacy Redirect for old Inventory path
router.get('/admin/inventory', protect, adminOnly, (req, res) => {
    res.redirect('/admin/items');
});

router.get('/admin/dashboard', protect, adminOnly, async (req, res) => {
    try {
        const stats = await getStats();
        // Just show recent activity on the dashboard
        const recentClaims = await Claim.find().populate('item').populate('claimer').sort({ createdAt: -1 }).limit(5);
        const recentItems = await Item.find().populate('reporter').sort({ createdAt: -1 }).limit(5);

        res.render('admin/dashboard', { 
            title: 'Admin Dashboard | CampusLost',
            stats,
            recentClaims,
            recentItems
        });
    } catch (err) {
        console.error(err);
        res.redirect('/items');
    }
});

// 2. Global Claims Management
router.get('/admin/claims', protect, adminOnly, async (req, res) => {
    try {
        const stats = await getStats();
        const claims = await Claim.find().populate('item').populate('claimer').sort({ createdAt: -1 });
        res.render('admin/claims', { title: 'Manage Claims | CampusLost', stats, claims });
    } catch (err) {
        res.redirect('/admin/dashboard');
    }
});

// 3. Global Inventory Management
router.get('/admin/items', protect, adminOnly, async (req, res) => {
    try {
        const stats = await getStats();
        const items = await Item.find().populate('reporter').sort({ createdAt: -1 });
        res.render('admin/items', { title: 'Global Inventory | CampusLost', stats, items });
    } catch (err) {
        res.redirect('/admin/dashboard');
    }
});

// 4. User Directory
router.get('/admin/users', protect, adminOnly, async (req, res) => {
    try {
        const stats = await getStats();
        const users = await User.find().sort({ createdAt: -1 });
        res.render('admin/users', { title: 'User Directory | CampusLost', stats, users });
    } catch (err) {
        res.redirect('/admin/dashboard');
    }
});

// --- MODERATION ACTIONS (UPDATED REDIRECTS) ---

router.post('/admin/claims/:id/:action', protect, adminOnly, async (req, res) => {
    const { action } = req.params;
    try {
        const claim = await Claim.findById(req.params.id).populate('item');
        if (!claim) return res.redirect('/admin/claims');

        if (action === 'approve') {
            claim.status = 'approved';
            await Item.findByIdAndUpdate(claim.item._id, { status: 'returned' });
            await Claim.updateMany({ item: claim.item._id, _id: { $ne: claim._id } }, { status: 'rejected' });
            req.flash('success_msg', 'Claim approved.');
        } else if (action === 'reject') {
            claim.status = 'rejected';
            req.flash('success_msg', 'Claim rejected.');
        }
        
        await claim.save();
        res.redirect('/admin/claims');
    } catch (err) {
        res.redirect('/admin/claims');
    }
});

router.post('/admin/items/:id/delete', protect, adminOnly, async (req, res) => {
    try {
        console.log(`[ADMIN] Deleting item: ${req.params.id}`);
        await Item.findByIdAndDelete(req.params.id);
        await Claim.deleteMany({ item: req.params.id });
        req.flash('success_msg', 'Item deleted.');
        res.redirect('/admin/inventory');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/inventory');
    }
});

router.post('/admin/users/:id/delete', protect, adminOnly, async (req, res) => {
    try {
        if (req.params.id === req.user.id.toString()) {
            req.flash('error_msg', 'Cannot delete yourself.');
            return res.redirect('/admin/users');
        }
        await User.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'User removed.');
        res.redirect('/admin/users');
    } catch (err) {
        res.redirect('/admin/users');
    }
});

module.exports = router;
