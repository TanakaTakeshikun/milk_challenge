if (typeof ReadableStream === 'undefined') {
  global.ReadableStream = require('stream/web').ReadableStream;
}
process.env.TZ = 'Asia/Tokyo'
globalThis.usertmp = new Map();
const querystring = require("node:querystring");
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const path = require('node:path');
const { EventHandler, CommandsBuilder } = require('./libs');
const logger = require('./helpers/getLogger');
const http = require("http");
require('dotenv').config()
const client = new Client({
  intents: Object.values(GatewayIntentBits),
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
  rest: 60000
});
client.logger = logger;

EventHandler(client, path.resolve(__dirname, './events'));
client.commands = CommandsBuilder(client, path.resolve(__dirname, './commands'));


// process.on('uncaughtException', (error) => {
//     console.error(error)
// });

client.login(process.env.TOKEN);

//GASでwakeさせること。

// http
//   .createServer(function (req, res) {
//     if (req.method == "POST") {
//       var data = "";
//       req.on("data", function (chunk) {
//         data += chunk;
//       });
//       req.on("end", function () {
//         if (!data) {
//           res.end("No post data");
//           return;
//         }
//         var dataObject = querystring.parse(data);
//         if (dataObject.type == "wake") {
//           res.end();
//           return;
//         }
//         res.end();
//       });
//     } else if (req.method == "GET") {
//       res.writeHead(200, { "Content-Type": "text/plain" });
//       res.end("Discord Bot is Oprateing!");
//     }
//   })
//   .listen(3000);