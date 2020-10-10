const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const User = mongoose.Schema({
    user_id: String,
    user_name: String,
    jemstones: { type: Number, default: 0 },
    transactions: [{type: ObjectId, ref: 'Transaction'}]
}, { timestamps: true });

module.exports = mongoose.model('User', User);