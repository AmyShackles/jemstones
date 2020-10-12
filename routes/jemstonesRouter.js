const User = require("../models/User.js");
const Transaction = require("../models/Transaction.js");

async function createTransaction(command, jType) {
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
    { user_name: receiver_username, $inc: { [jType]: amount, stones: amount }},
    { upsert: true, new: true }
  );
  if (!receiver && !amount) {
    return `You cannae gift ${jType} without specifying a receiver and an amount`;
  } else if (!receiver) {
    return `You cannae gift ${jType} without specifying a receiver`;
  } else if (!amount) {
    return `You cannae gift ${jType} without specifying an amount`;
  } else if (amount < 0) {
      let karma = await User.findOneAndUpdate(
          {user_id: giver_id},
          {$inc: { [jType]: amount, stones: amount }},
          {upsert: true, new: true}
      );
      return `<@${giver_id}|${giver_username}> attempted to remove ${Math.abs(amount)} ${jType} from <@${receiver_id}|${receiver_username}> - their own ${jType} are now down to ${karma[jType]}`
  } else {
    let doc = await Transaction.create({channel_id, channel_name, giver, receiver, amount, type: jType });
    return `<@${giver_id}|${giver_username}> gifted <@${receiver_id}|${receiver_username}> a whole ${doc.amount} ${jType}!`;
  }
}

module.exports = { createTransaction };
