const mongoose = require("mongoose");

const User = mongoose.Schema(
    {
        user_id: String,
        user_name: String,
        display_name: String,
        image: String,
        amystones: { type: Number, default: 0 },
        colestones: { type: Number, default: 0 },
        gerstones: { type: Number, default: 0 },
        harrystones: { type: Number, default: 0 },
        jamstones: { type: Number, default: 0 },
        janstones: { type: Number, default: 0 },
        jemstones: { type: Number, default: 0 },
        jomstones: { type: Number, default: 0 },
        jumstones: { type: Number, default: 0 },
        stones: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", User);
