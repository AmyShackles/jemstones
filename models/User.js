const mongoose = require('mongoose');

const User = mongoose.Schema(
    {
        user_id: String,
        user_name: String,
        display_name: String,
        image: String,
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

User.post('find', (docs) => {
    docs.forEach(doc => {
        if (
            doc.stones !==
            doc.colestones +
            doc.gerstones +
            doc.harrystones +
            doc.jamstones +
            doc.janstones +
                doc.jemstones +
                doc.jomstones +
                doc.jumstones 

        ) {
            doc.stones =
                doc.colestones +
                doc.gerstones +
                doc.harrystones +
                doc.jamstones +
                doc.janstones +
                    doc.jemstones +
                    doc.jomstones +
                    doc.jumstones 
        }
    })
    return;
})
module.exports = mongoose.model('User', User);