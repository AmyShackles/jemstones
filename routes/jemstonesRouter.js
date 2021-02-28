const User = require("../models/User.js");
const Transaction = require("../models/Transaction.js");
const axios = require("axios");

async function createOrUpdateGiver(
    id,
    user_name,
    jType,
    amount,
    giftee_id,
    giftee_username,
    trigger_id,
    client
) {
    const user = await User.findOne({ user_id: id });
    if (user) {
        return await updateGiver(
            user,
            jType,
            amount,
            giftee_id,
            giftee_username,
            trigger_id,
            client
        );
    } else {
        return await createGiver(
            id,
            user_name,
            jType,
            amount,
            giftee_id,
            giftee_username,
            trigger_id,
            client
        );
    }
}
function createGiver(
    id,
    user_name,
    jType,
    amount,
    giftee_id,
    giftee_username,
    trigger_id,
    client
) {
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
                const message = `Just to let you know, <@${id}|${user_name}> totally tried to steal ${Math.abs(
                    amount
                )} ${jType} from you.  As penance, they have been stripped of all stones.`;
                await axios.post(
                    `https://slack.com/api/chat.postMessage?token=${process.env.SLACK_BOT_TOKEN}&channel=${giftee_id}&text=${message}&pretty=1`
                );
                let user = await User.create({
                    user_id: id,
                    image: data.profile.image_192,
                    display_name: data.profile.display_name,
                });
                try {
                        await client.views.open({
                                trigger_id,
                                view: {
                                    type: "modal",
                                    title: {
                                        type: "plain_text",
                                        text: "10 PTS FROM GRYFFINDOR!",
                                        emoji: true,
                                    },
                                    blocks: [
                                        {
                                            type: "section",
                                            text: {
                                                type: "mrkdwn",
                                                text: `So.  It *_should_* go without saying, but you shouldnae steal from others.\n\tYou attempted to steal ${Math.abs(
                                                    amount
                                                )} ${jType} from ${giftee_username}.\n\tAll is lost.  Literally.  You're reset to zero.\n\n\t*LET THIS BE A LESSON TO YOU.*`,
                                            },
                                        },
                                        {
                                            type: "image",
                                            image_url:
                                                "https://media.giphy.com/media/R2nvBkAW7XIRy/giphy.gif",
                                            alt_text: "Severus Snape says 'Obviously'",
                                        },
                                    ],
                                },
                            });
                    await resetStones(user.user_id);
                    return "Karma is a bitch.";
                } catch (err) {
                    console.error(err);
                }
            }
        });
}
async function updateGiver(
    user,
    jType,
    amount,
    giftee_id,
    giftee_username,
    trigger_id,
    client
) {
    if (amount > 0) {
        return user;
    } else {
        try {
            const message = `Just to let you know, <@${user.user_id}|${
                user.user_name
            }> totally tried to steal ${Math.abs(
                amount
            )} ${jType} from you.  As penance, they have been stripped of all stones.`;
            await axios.post(
                `https://slack.com/api/chat.postMessage?token=${process.env.SLACK_BOT_TOKEN}&channel=${giftee_id}&text=${message}&pretty=1`
            );
            await client.views.open({
                trigger_id,
                view: {
                    type: "modal",
                    title: {
                        type: "plain_text",
                        text: "10 PTS FROM GRYFFINDOR!",
                        emoji: true,
                    },
                    blocks: [
                        {
                            type: "section",
                            text: {
                                type: "mrkdwn",
                                text: `So.  It *_should_* go without saying, but you shouldnae steal from others.\n\tYou attempted to steal ${Math.abs(
                                    amount
                                )} ${jType} from ${giftee_username}.\n\tAll is lost.  Literally.  You're reset to zero.\n\n\t*LET THIS BE A LESSON TO YOU.*`,
                            },
                        },
                        {
                            type: "image",
                            image_url:
                                "https://media.giphy.com/media/R2nvBkAW7XIRy/giphy.gif",
                            alt_text: "Severus Snape says 'Obviously'",
                        },
                    ],
                },
            });
            await resetStones(user.user_id);
            return "Karma is a bitch.";
        } catch (err) {
            console.error(err);
        }
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

async function createTransaction(
    giver_id,
    giver_username,
    receiver_id,
    receiver_username,
    channel_id,
    channel_name,
    amount,
    trigger_id,
    client,
    jType
) {
    const giver = await createOrUpdateGiver(
        giver_id,
        giver_username,
        jType,
        amount,
        receiver_id,
        receiver_username,
        trigger_id,
        client
    );
    if (typeof giver === "string") {
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

async function resetStones(id) {
    const user = await User.findOne({ user_id: id });
    if (user) {
        user.amystones = 0;
        user.colestones = 0;
        user.gerstones = 0;
        user.harrystones = 0;
        user.jamstones = 0;
        user.janstones = 0;
        user.jemstones = 0;
        user.jomstones = 0;
        user.jumstones = 0;
        user.save();
        return;
    } else {
        return axios
            .get(
                `https://slack.com/api/users.profile.get?token=${process.env.SLACK_BOT_TOKEN}&user=${id}&pretty=1`
            )
            .then(async ({ data }) => {
                return await User.create({
                    user_id: id,
                    user_name,
                    image: data.profile.image_192,
                    display_name: data.profile.display_name,
                });
            })
            .catch((err) => console.error(err));
    }
}

module.exports = { createTransaction, resetStones };
