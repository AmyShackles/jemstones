const User = require("../models/User.js");
const Transaction = require("../models/Transaction.js");
const axios = require("axios");

async function createOrUpdateGiver(
  id,
  user_name,
  jType,
  amount,
  giftee_id,
  giftee_username
) {
  const user = await User.findOne({ user_id: id });
  if (user) {
    return await updateGiver(user, jType, amount, giftee_id, giftee_username);
  } else {
    return await createGiver(
      id,
      user_name,
      jType,
      amount,
      giftee_id,
      giftee_username
    );
  }
}
function createGiver(id, user_name, jType, amount, giftee_id, giftee_username) {
  return axios
    .get(
      `https://slack.com/api/users.profile.get?token=${process.env.SLACK_BOT_TOKEN}&user=${id}&pretty=1`
    )
    .then(async ({ data }) => {
      if (amount > 0) {
        return await User.create({
          user_id: id,
          user_name,
          image: data.profile.image_192,
          display_name: data.profile.display_name,
        });
      } else {
        let karma = await User.create({
          user_id: id,
          image: data.profile.image_192,
          display_name: data.profile.display_name,
          $inc: { [jType]: amount, stones: amount },
        });
        return `You attempted to remove ${Math.abs(
          amount
        )} ${jType} from <@${giftee_id}|${giftee_username}>.  In the interest of karma, they have been subtracted from your own.  You now have ${
          karma[jType]
        } ${jType}`;
      }
    });
}
function updateGiver(user, jType, amount, giftee_id, giftee_username) {
  if (amount > 0) {
    return user;
  } else {
    user[jType] += amount;
    user.stones += amount;
    user.save();
    return `You attempted to remove ${Math.abs(
      amount
    )} ${jType} from <@${giftee_id}|${giftee_username}>.  In the interest of karma, they have been subtracted from your own.  You now have ${
      user[jType]
    } ${jType}`;
  }
}

async function createOrUpdateGiftee(
  id,
  user_name,
  jType,
  amount,
  gifter_id,
  gifter_username
) {
  const user = await User.findOne({ user_id: id });
  if (user) {
    return await updateGiftee(
      user,
      id,
      jType,
      amount,
      gifter_id,
      gifter_username
    );
  } else {
    return await createGiftee(
      id,
      user_name,
      jType,
      amount,
      gifter_id,
      gifter_username
    );
  }
}
function createGiftee(
  id,
  user_name,
  jType,
  amount,
  gifter_id,
  gifter_username
) {
  return axios
    .get(
      `https://slack.com/api/users.profile.get?token=${process.env.SLACK_BOT_TOKEN}&user=${id}&pretty=1`
    )
    .then(async ({ data }) => {
      const message = `<@${gifter_id}|${gifter_username}> just gifted you ${amount} ${jType}`;
      await axios.post(
        `https://slack.com/api/chat.postMessage?token=${process.env.SLACK_BOT_TOKEN}&channel=${id}&text=${message}&pretty=1`
      );
      return User.create({
        user_id: id,
        user_name,
        image: data.profile.image_192,
        display_name: data.profile.display_name,
      });
    })
    .catch((err) => console.error(err));
}

function updateGiftee(user, id, jType, amount, gifter_id, gifter_username) {
  user[jType] += amount;
  user.stones += amount;
  user.save();
  const message = `<@${gifter_id}|${gifter_username}> just gifted you ${amount} ${jType}`;
  return axios
    .post(
      `https://slack.com/api/chat.postMessage?token=${process.env.SLACK_BOT_TOKEN}&channel=${id}&text=${message}&pretty=1`
    )
    .then(() => {
      return user;
    })
    .catch((err) => console.error(err));
}

async function createTransaction(command, jType) {
  if (!command.text) {
    return `You cannae gift ${jType} without specifying a username and amount`;
  }
  const input = command.text.split(" ");
  const taker = input[0].split("|");
  const amount = parseInt(input[1]);
  if (taker.length < 2 && !/\|/.test(input[0])) {
    return `You cannae gift ${jType} without specifying a username`;
  }
  if (!amount) {
    return `You cannae gift ${jType} without specifying an amount`;
  } else {
    const giver_id = command.user_id;
    const giver_username = command.user_name;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    const channel_id = command.channel_id;
    const channel_name = command.channel_name;
    const trigger_id = command.trigger_id;
    console.log({
        giver_id,
        giver_username,
        receiver_id,
        receiver_username,
        channel_id,
        channel_name,
        trigger_id,
    });
    if (giver_id === receiver_id) {
    }
    const giver = await createOrUpdateGiver(
        giver_id,
        giver_username,
        jType,
        amount,
        receiver_id,
        receiver_username
    );
    if (typeof giver === "string") {
      const message = `Just to let you know, <@${giver_id}|${giver_username}> totally tried to steal ${Math.abs(
        amount
      )} ${jType} from you.`;
      await axios.post(
        `https://slack.com/api/chat.postMessage?token=${process.env.SLACK_BOT_TOKEN}&channel=${receiver_id}&text=${message}&pretty=1`
      );
      return giver;
    }
    const receiver = await createOrUpdateGiftee(
      receiver_id,
      receiver_username,
      jType,
      amount,
      giver_id,
      giver_username
    );
    let doc = await Transaction.create({
      channel_id,
      channel_name,
      giver,
      receiver,
      amount,
      type: jType,
    });
    return `You gifted <@${receiver_id}|${receiver_username}> a whole ${doc.amount} ${jType}!`;
  }
}

module.exports = { createTransaction };
