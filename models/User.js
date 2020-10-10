const mongoose = require('mongoose');

const User = mongoose.Schema({
    user_id: String,
    user_name: String,
    jemstones: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('User', User);