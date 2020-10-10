require("dotenv").config();
const { App, ExpressReceiver, LogLevel } = require("@slack/bolt");
const Transaction = require('./models/Transaction');
const User = require('./models/User.js');
const { createTransaction } = require('./routes/jemstonesRouter.js');
const mongoose = require('mongoose');
const db = require("./data/db.js");
const mongoURI = process.env.MONGO_URI;
mongoose.Promise = global.Promise;

const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const router = receiver.router;


const sendUserError = (status, message, res) => {
    res.status(status).json({ error: message });
    return;
}

router.get('/transactions', async (req, res) => {
    Transaction.find()
    .select('-__v -_id')
    .populate('giver receiver')
    .then(transactions => {
        res.status(200).json({ transactions})
    })
    .catch(err => sendUserError(500, err.message, res))
})

router.get('/users', async (req, res) => {
    User.find()
    .select('-__v -_id')
    .then(users => {
        res.status(200).json({ users })
    })
    .catch(err => sendUserError(500, err.message, res))
})



db.connectTo(mongoURI)
  .then(() => console.log("\n...API Connected to database ...\n"))
  .catch((err) => {
    console.error(`\n*** ERROR connecting to database****: ${err}`);
  });

const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver,
  logLevel: LogLevel.DEBUG,
});

/* This event is no longer being subscribed to
slackApp.message("jemstones", async ({ message, say }) => {
  await say(`Did you mention jemstones, <@${message.user}>!?`);
});
*/

slackApp.command("/jemstones", async ({ command, ack, respond }) => {
  await ack();
  const response = await createTransaction(command);
  await respond(response);
});

slackApp.error(async (error) => {
  const message = `DOES NOT COMPUTE: ${error.toString()}`;
  console.error(message);
});

(async () => {
  await slackApp.start(process.env.PORT || 8080);
  console.log("* Bolt app is running! (better go catch it, then)");
})();
