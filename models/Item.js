const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: ['Electronics', 'Wallets/Bags', 'Keys', 'Documents', 'Others'] },
    location: { type: String, required: true },
    date: { type: Date, default: Date.now },
    itemType: { type: String, required: true, enum: ['lost', 'found'] },
    imageUrl: { type: String },
    status: { type: String, default: 'open', enum: ['open', 'claimed', 'returned'] },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', itemSchema);
