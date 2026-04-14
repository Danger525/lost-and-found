const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        req.flash('error_msg', 'Not authorized, please log in');
        return res.redirect('/login');
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        req.user = await User.findById(decoded.id).select('-password');
        
        // Add compatibility with old session code
        res.locals.user = req.user;
        
        next();
    } catch (error) {
        console.error(error);
        res.clearCookie('token');
        req.flash('error_msg', 'Session expired, please log in again');
        res.redirect('/login');
    }
};

const adminOnly = (req, res, next) => {
    console.log(`[AUTH] Admin access check for: ${req.user ? req.user.username : 'Unknown'}`);
    console.log(`[AUTH] User isAdmin state: ${req.user ? req.user.isAdmin : 'False'}`);
    
    if (req.user && req.user.isAdmin) {
        return next();
    }
    
    console.warn(`[AUTH] Access denied for user: ${req.user ? req.user.username : 'Unknown'}`);
    req.flash('error_msg', 'Access denied. Admins only.');
    res.redirect('/items');
};

const setUser = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};

module.exports = { protect, adminOnly, setUser };
