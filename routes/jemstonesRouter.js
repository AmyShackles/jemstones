const User = require("../models/User.js");
const Transaction = require("../models/Transaction.js");

async function createTransaction(command) {
  const input = command.text.split(" ");
  const giver_id = command.user_id;
  const giver_username = command.user_name;
  const taker = input[0].split("|");
  const receiver_id = taker[0].slice(2);
  const receiver_username = taker[1].slice(0, -1);
  const amount = parseInt(input[1]);
  const channel_id = command.channel_id;
  const channel_name = command.channel_name;
  const giver = await User.findOneAndUpdate(
    { user_id: giver_id },
    { user_name: giver_username },
    { new: true }
  );
  const receiver = await User.findOneAndUpdate(
    { user_id: receiver_id },
    { user_name: receiver_username, $inc: { 'jemstones': amount }},
    { upsert: true, new: true }
  );
  if (!receiver && !amount) {
    return `You cannae gift jemstones without specifying a receiver and an amount`;
  } else if (!receiver) {
    return `You cannae gift jemstones without specifying a receiver`;
  } else if (!amount) {
    return `You cannae gift jemstones without specifying an amount`;
  } else if (amount < 0) {
      let karma = await User.findOneAndUpdate(
          {user_id: giver_id},
          {$inc: { jemstones: amount }},
          {upsert: true, new: true}
      );
      return `<@${giver_id}|${giver_username}> attempted to remove ${Math.abs(amount)} jemstones from <@${receiver_id}|${receiver_username}> - their own jemstones are now down to ${karma.jemstones}`
  } else {
    let doc = await Transaction.create({channel_id, channel_name, giver, receiver, amount });
    return `<@${giver_id}|${giver_username}> gifted <@${receiver_id}|${receiver_username}> a whole ${doc.amount} jemstones!`;
  }
}

module.exports = { createTransaction };
