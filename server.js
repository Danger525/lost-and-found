require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Flash messages still need session to persist
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

const { setUser } = require('./middleware/auth');

// Global Variables & Identity
app.use(setUser);
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/items'));
app.use('/', require('./routes/admin'));
app.use('/', require('./routes/user')); // Dynamic routes last

app.get('/', (req, res) => {
    res.render('index', { title: 'Home | Campus Lost & Found' });
});

// Export for Vercel
module.exports = app;

// Start Server locally
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}
