require("dotenv").config();
const { App, ExpressReceiver, LogLevel } = require("@slack/bolt");
const { createTransaction } = require('./routes/jemstonesRouter.js');
const mongoose = require('mongoose');
const db = require("./data/db.js");
const mongoURI = process.env.MONGO_URI;
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
const server = receiver.app;

// server.use('/jemstones', jemstonesRouter);
mongoose.Promise = global.Promise;


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

module.exports = server;