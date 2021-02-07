const mongoose = require('mongoose');

const User = mongoose.Schema(
    {
        user_id: String,
        user_name: String,
        display_name: String,
        image: String,
        jamstones: { type: Number, default: 0 },
        jemstones: { type: Number, default: 0 },
        jomstones: { type: Number, default: 0 },
        jumstones: { type: Number, default: 0 },
        janstones: { type: Number, default: 0 },
        stones: { type: Number, default: 0 },
    },
    { timestamps: true }
);

User.post('find', (docs) => {
    docs.forEach(doc => {
        if (
            doc.stones !==
            doc.jamstones +
                doc.jemstones +
                doc.jomstones +
                doc.jumstones +
                doc.janstones
        ) {
            doc.stones =
                doc.jamstones +
                doc.jemstones +
                doc.jomstones +
                doc.jumstones +
                doc.janstones;
        }
    })
    return;
})
module.exports = mongoose.model('User', User);