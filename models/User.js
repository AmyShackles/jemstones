const mongoose = require('mongoose');

const User = mongoose.Schema({
    user_id: String,
    user_name: String,
    jamstones: { type: Number, default: 0 },
    jemstones: { type: Number, default: 0 },
    jomstones: { type: Number, default: 0 },
    jumstones: { type: Number, default: 0 },

}, { timestamps: true });

module.exports = mongoose.model('User', User);