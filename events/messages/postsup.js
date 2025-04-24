const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Colors } = require('discord.js');
const { CustomEmbed } = require('../../libs');
const setting = require('../../setting.json');
module.exports = {
  name: Events.MessageCreate,
  filter: (m) => m.channel.id === setting.bot.channelid && m.attachments.first(),
  async execute(message) {
    const attachments = message.attachments.map(x => x.url);
    const content = message.content;
    const title = content.match(/作品タイトル[:：](.+)/)?.[1]?.trim()||""
    const description = content.match(/作品に込めた思い[:：](.+)/)?.[1]?.trim()||""
    const author = content.match(/作者名[:：](.+)/)?.[1]?.trim() || message.author.globalName;
    const confirm_embed = new CustomEmbed()
      .setTitle(`✅${author}の投稿確認`)
      .setDescription(`作者名:${author}\n作品タイトル:${title}\n作品に込めた思い:${description}\n**修正および確定は下記のボタンを押してください**`)
      .setColor(Colors.Green)
      .create();
    const msg = await message.author.send({ embeds: [confirm_embed], files: attachments });
    const confirm_button = new ButtonBuilder()
      .setCustomId(`confirm_${msg.id}`)
      .setLabel('確認/修正')
      .setStyle(ButtonStyle.Success);
    const row = new ActionRowBuilder()
      .addComponents(confirm_button);
    await msg.edit({ components: [row] })
    await message.delete();
  }
};
