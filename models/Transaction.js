const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const Transaction = mongoose.Schema({
    channel_id: String,
    channel_name: String,
    giver: { type: ObjectId, ref: 'User'},
    receiver: { type: ObjectId, ref: 'User'},
    amount: Number,
    type: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', Transaction);