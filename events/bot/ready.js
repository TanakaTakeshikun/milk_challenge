const { REST, Routes, Events, ActivityType } = require("discord.js");
const setting = require("../../setting.json");
const { CustomEmbed} = require('../../libs');
module.exports = {
  name: Events.ClientReady,
  async execute(client, Log) {
    Log.info(`Logged in as ${client.user.tag}`);
    Log.info("Rebuiding command...");
    const commandsData = client.commands.map((command) => command.build());
    Log.info(`Rebuilt ${commandsData.length} commands`);
    Log.info("Deploying command...");
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    rest
      .put(Routes.applicationCommands(client.user.id, setting.bot.serverid), {
        body: commandsData,
      })
      .then((data) => {
        Log.info(`Deployed ${data.length} commands`);
        Log.info(`Ready!`);
      })
      .catch((error) => {
        Log.error(error);
      });
    client.user.setPresence({
      activities: [
        { name: setting.bot.activitiename, type: ActivityType.Streaming },
      ],
    });
  },
};
