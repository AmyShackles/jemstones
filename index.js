require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const Transaction = require("./models/Transaction");
const User = require("./models/User.js");
const {
    createTransaction,
    resetStones,
} = require("./routes/jemstonesRouter.js");
const mongoose = require("mongoose");
const db = require("./data/db.js");
const mongoURI = process.env.MONGO_URI;
mongoose.Promise = global.Promise;
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
});

const router = receiver.router;

router.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", `${process.env.REACT_APP}`);
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
const sendUserError = (status, message, res) => {
    res.status(status).json({ error: message });
    return;
};
router.get("/", (req, res) => {
    res.status(200).send("Site is up and running");
});

router.get("/leaderboard", (req, res) => {
    User.find()
        .select("-__v -_id -createdAt -updatedAt")
        .sort("-stones")
        .lean()
        .then((leaders) => {
            res.status(200).json({ leaders });
        })
        .catch((err) => sendUserError(500, err.message, res));
});

router.get("/leaderboard/:type", (req, res) => {
    const { type } = req.params;
    let sort;
    if (type) {
        if (/amy/.test(type)) {
            sort = "-amystones";
        } else if (/col/.test(type)) {
            sort = "-colestones";
        } else if (/ger/.test(type)) {
            sort = "-gerstones";
        } else if (/har/.test(type)) {
            sort = "-harrystones";
        } else if (/jam/.test(type)) {
            sort = "-jamstones";
        } else if (/jan/.test(type)) {
            sort = "-janstones";
        } else if (/jem/.test(type)) {
            sort = "-jemstones";
        } else if (/jom/.test(type)) {
            sort = "-jomstones";
        } else if (/jum/.test(type)) {
            sort = "-jumstones";
        } else if (/tice/.test(type)) {
            sort = "-ticestones";
        } else {
            sort = "-stones";
        }
    } else {
        sort = "-stones";
    }
    User.find()
        .select("-__v -_id -createdAt -updatedAt")
        .sort(sort)
        .lean()
        .then((leaders) => {
            res.status(200).json({ leaders });
        })
        .catch((err) => sendUserError(500, err.message, res));
});

router.get("/transactions", async (req, res) => {
    Transaction.find()
        .select("-__v -_id -createdAt -updatedAt -channel_id")
        .populate({ path: "giver", select: "user_name user_id" })
        .populate({ path: "receiver", select: "user_name user_id" })
        .then((transactions) => {
            res.status(200).json({ transactions });
        })
        .catch((err) => sendUserError(500, err.message, res));
});

db.connectTo(mongoURI)
    .then(() => console.log("\n...API Connected to database ...\n"))
    .catch((err) => {
        console.error(`\n*** ERROR connecting to database****: ${err}`);
    });

const slackApp = new App({
    token: process.env.SLACK_BOT_TOKEN,
    receiver,
});

function earlyReturn(command, input, taker, amount, jType) {
    if (!command.text) {
        return `You cannae gift ${jType} without specifying a username and amount`;
    }
    if (taker.length < 2 && !/\|/.test(input[0])) {
        return `You cannae gift ${jType} without specifying a username`;
    }
    if (!amount) {
        return `You cannae gift ${jType} without specifying an amount`;
    }
    if (isNaN(amount)) {
        return `You cannae gift ${jType} in amount of that kind.`;
    }
}

async function penaltyForGreed(
    client,
    view_id,
    giver_id,
    giver_username,
    amount,
    jType
) {
    const message = await resetStones(
        giver_id,
        giver_username,
        amount,
        "take",
        jType
    );
    try {
        await client.views.update({
            view_id,
            view: {
                type: "modal",
                title: {
                    type: "plain_text",
                    text: "10 PTS FROM GRYFFINDOR!",
                    emoji: true,
                },
                blocks: [
                    {
                        type: "header",
                        text: {
                            type: "plain_text",
                            text: "Instant Regret",
                            emoji: true,
                        },
                    },
                    {
                        type: "section",
                        text: {
                            type: "mrkdwn",
                            text: `So.  It *_should_* go without saying, but you cannae gift yourself jemstone.\n${message}\n\n\t*LET THIS BE A LESSON TO YOU.*`,
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
    } catch (err) {
        console.error(err);
    }
}

async function openFirstModal(client, jType, trigger_id) {
    let view_id;
    try {
        const res = await client.views.open({
            trigger_id,
            view: {
                type: "modal",
                title: {
                    type: "plain_text",
                    text: `${jType}...`,
                },
                blocks: [
                    {
                        type: "section",
                        text: {
                            type: "plain_text",
                            text: ":meow_knife: Working on it...",
                        },
                    },
                ],
            },
        });
        view_id = res.view.id;
    } catch (err) {
        console.error(err);
        return await respond(
            "Spot of bother -- if you wouldn't mind terribly, can you retry that command?"
        );
    }
    return view_id;
}
/*
    command.text for following slash commands is in the form:
    "<@U1234|user> 23"
    input = command.text.split(" ") turns it into an array
    ["<@U1234|user>", "23"]
    taker = input[0].split("|") separates the user id from user name
    ["<@U1234", "user>"]
    amount = +input[1] to coerce it into a number from a string.
        This was changed from parseInt() to allow conversion of Infinity
    reciever_id = taker[0].slice(2) is to remove "<@"
    receiver_username = taker[1].slice(0,-1) is to remove the ">"
*/
slackApp.command("/amystones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "amystones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Amystones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "amystones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "amystones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});
slackApp.command("/colestones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "colestones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Colestones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "colestones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "colestones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});
slackApp.command("/gerstones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "gerstones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Gerstones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "gerstones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "gerstones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});
slackApp.command("/harrystones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "harrystones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Harrystones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "harrystones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "harrystones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});
slackApp.command("/jamstones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "jamstones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Jamstones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "jamstones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "jamstones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});
slackApp.command("/janstones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "janstones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Janstones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "janstones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "janstones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});
slackApp.command("/jemstones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "jemstones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Jemstones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "jemstones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "jemstones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});
slackApp.command("/jomstones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "jomstones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Jomstones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "jomstones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "jomstones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});
slackApp.command("/jumstones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "jumstones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Jumstones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "jumstones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "jumstones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});

slackApp.command("/ticestones", async ({ command, ack, respond, client }) => {
    await ack();
    const input = command.text.split(" ");
    const taker = input[0].split("|");
    const amount = +input[1];
    const incorrectInvocation = earlyReturn(
        command,
        input,
        taker,
        amount,
        "ticestones"
    );
    if (incorrectInvocation) {
        return await respond(incorrectInvocation);
    }
    const view_id = await openFirstModal(
        client,
        "Ticestones",
        command.trigger_id
    );
    const {
        user_id: giver_id,
        user_name: giver_username,
        channel_id,
        channel_name,
    } = command;
    const receiver_id = taker[0].slice(2);
    const receiver_username = taker[1].slice(0, -1);
    if (amount > 0 && giver_id === receiver_id) {
        return await penaltyForGreed(
            client,
            view_id,
            giver_id,
            giver_username,
            amount,
            "ticestones"
        );
    } else {
        try {
            const response = await createTransaction(
                giver_id,
                giver_username,
                receiver_id,
                receiver_username,
                channel_id,
                channel_name,
                amount,
                view_id,
                client,
                "ticestones"
            );
            await respond(response);
        } catch (error) {
            console.error(error);
        }
    }
});

slackApp.error(async (error) => {
    const message = `DOES NOT COMPUTE: ${error.toString()}`;
    console.error(message);
});

(async () => {
    await slackApp.start(process.env.PORT || 8080);
    console.log("* Bolt app is running! (better go catch it, then)");
})();
