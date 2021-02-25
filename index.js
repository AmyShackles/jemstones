require("dotenv").config();
const { App, ExpressReceiver } = require("@slack/bolt");
const Transaction = require("./models/Transaction");
const User = require("./models/User.js");
const { createTransaction } = require("./routes/jemstonesRouter.js");
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

router.get("/", async (req, res) => {
  const { leaderboard } = req.query;
  let sort;
  if (leaderboard && /jam/.test(leaderboard)) {
    sort = "-jamstones";
  } else if (leaderboard && /jem/.test(leaderboard)) {
    sort = "-jemstones";
  } else if (leaderboard && /jom/.test(leaderboard)) {
    sort = "-jomstones";
  } else if (leaderboard && /jum/.test(leaderboard)) {
    sort = "-jumstones";
  } else if (leaderboard && /jan/.test(leaderboard)) {
    sort = "-janstones";
  } else {
    sort = "-stones";
  }
  User.find()
    .select("-__v -_id")
    .sort(sort)
    .then((leaders) => {
      res.status(200).json({ leaders });
    });
});
router.get("/:type", async (req, res) => {
  const { type } = req.params;
  let sort;
  if (type && /jam/.test(type)) {
    sort = "-jamstones";
  } else if (type && /jem/.test(type)) {
    sort = "-jemstones";
  } else if (type && /jom/.test(type)) {
    sort = "-jomstones";
  } else if (type && /jum/.test(type)) {
    sort = "-jumstones";
  } else if (type && /jan/.test(type)) {
    sort = "-janstones";
  } else {
    sort = "-stones";
  }
  User.find()
    .select("-__v -_id -createdAt -updatedAt")
    .sort(sort)
    .then((leaders) => {
      res.status(200).json({ leaders });
    });
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

/* This event is no longer being subscribed to
slackApp.message("jemstones", async ({ message, say }) => {
  await say(`Did you mention jemstones, <@${message.user}>!?`);
});
*/
slackApp.command("/colestones", async ({ command, ack, respond }) => {
    try {
        await ack();
        const response = await createTransaction(command, "colestones");
        await respond(response);
    } catch (error) {
        console.error(error);
    }
});
slackApp.command("/gerstones", async ({ command, ack, respond }) => {
    try {
        await ack();
        const response = await createTransaction(command, "gerstones");
        await respond(response);
    } catch (error) {
        console.error(error);
    }
});
slackApp.command("/harrystones", async ({ command, ack, respond }) => {
    try {
        await ack();
        const response = await createTransaction(command, "harrystones");
        await respond(response);
    } catch (error) {
        console.error(error);
    }
});
slackApp.command("/jamstones", async ({ command, ack, respond }) => {
    try {
        await ack();
        const response = await createTransaction(command, "jamstones");
        await respond(response);
    } catch (error) {
        console.error(error);
    }
});
slackApp.command("/janstones", async ({ command, ack, respond }) => {
    try {
        await ack();
        const response = await createTransaction(command, "janstones");
        await respond(response);
    } catch (error) {
        console.error(error);
    }
});
slackApp.command("/jemstones", async ({ command, ack, respond }) => {
    try {
        await ack();
        const response = await createTransaction(command, "jemstones");
        await respond(response);
    } catch (error) {
        console.error(error);
    }
});
slackApp.command("/jomstones", async ({ command, ack, respond }) => {
    try {
        await ack();
        const response = await createTransaction(command, "jomstones");
        await respond(response);
    } catch (error) {
        console.error(error);
    }
});
slackApp.command("/jumstones", async ({ command, ack, respond }) => {
    try {
        await ack();
        const response = await createTransaction(command, "jumstones");
        await respond(response);
    } catch (error) {
        console.error(error);
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
