const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate Token Utility
const generateToken = (user) => {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
};

// Unified Response Handler (Handles both API + Browser)
const sendResponse = (req, res, user, statusCode = 200) => {
    const token = generateToken(user);

    // Set HTTP-Only Cookie
    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Determine redirection URL based on role
    const redirectUrl = user.isAdmin ? '/admin/dashboard' : `/${user.username}/items`;

    // Handle API Request (Postman/Mobile)
    if (req.headers['content-type'] === 'application/json') {
        return res.status(statusCode).json({
            success: true,
            token,
            redirectUrl,
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                isAdmin: user.isAdmin
            }
        });
    }

    // Handle Browser Request (Redirect)
    res.redirect(redirectUrl);
};

// --- AUTH PAGES ---

router.get('/register', (req, res) => {
    res.render('register', { title: 'Register | CampusLost' });
});

router.get('/login', (req, res) => {
    res.render('login', { title: 'Login | CampusLost' });
});

// --- AUTH LOGIC ---

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (user) {
            if (req.headers['content-type'] === 'application/json') {
                return res.status(400).json({ message: 'User already exists' });
            }
            req.flash('error_msg', 'Username or Email already exists');
            return res.redirect('/register');
        }

        user = new User({ username, email, password });
        await user.save();

        sendResponse(req, res, user, 201);

    } catch (err) {
        console.error(err);
        if (req.headers['content-type'] === 'application/json') {
            return res.status(500).json({ message: 'Server Error' });
        }
        res.status(500).send('Server Error');
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            if (req.headers['content-type'] === 'application/json') {
                return res.status(400).json({ message: 'Invalid credentials' });
            }
            req.flash('error_msg', 'Invalid email or password');
            return res.redirect('/login');
        }

        sendResponse(req, res, user);

    } catch (err) {
        console.error(err);
        if (req.headers['content-type'] === 'application/json') {
            return res.status(500).json({ message: 'Server Error' });
        }
        res.status(500).send('Server Error');
    }
});

router.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// --- PROTECTED ROUTES ---

router.get('/profile', protect, async (req, res) => {
    try {
        const Item = require('../models/Item');
        const Claim = require('../models/Claim');

        const myItems = await Item.find({ reporter: req.user.id });
        const myClaims = await Claim.find({ claimer: req.user.id }).populate('item');

        res.render('profile', {
            title: 'My Profile | CampusLost',
            myItems,
            myClaims,
            user: req.user
        });

    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

module.exports = router;
