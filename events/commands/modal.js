const { Events, Colors, AttachmentBuilder } = require('discord.js');
const { CustomEmbed, GCP } = require('../../libs');
const path = require('path');
const axios = require('axios');
const gcp = new GCP();
const cacheWebhooks = new Map();
const setting = require('../../setting.json');
async function sendMessage({ interaction, content, channel, files }) {
  const nickname = interaction.user.globalName;
  const avatarURL = interaction.user.avatarURL({ dynamic: true });
  const webhook = await getWebhookInChannel(channel);
  webhook.send({
    embeds: [content],
    username: nickname,
    avatarURL: avatarURL,
    files: files
  }).catch(e => console.error(e));
}

async function getWebhookInChannel(channel) {
  //webhookのキャッシュを自前で保持し速度向上
  const webhook = cacheWebhooks.get(channel.id) ?? await getWebhook(channel)
  return webhook;
}

async function getWebhook(channel) {
  //チャンネル内のWebhookを全て取得
  const webhooks = await channel.fetchWebhooks();
  //tokenがある（＝webhook製作者がbot自身）Webhookを取得、なければ作成する
  const webhook = webhooks?.find((v) => v.token) ?? await channel.createWebhook({ name: "Milkchallenge" });
  //キャッシュに入れて次回以降使い回す
  if (webhook) cacheWebhooks.set(channel.id, webhook);
  return webhook;
}

module.exports = {
  name: Events.InteractionCreate,
  filter: (i) => i.isModalSubmit() && i.customId.startsWith('submission_modal'),
  async execute(interaction) {
    await interaction.reply({ content: '処理中...', flags: 64 });
    const author = interaction.fields.getTextInputValue('author');
    const description = interaction.fields.getTextInputValue('description');
    const title = interaction.fields.getTextInputValue('title');
    const datas = await gcp.getRows({ type: 'userdata' });
    const num = datas.length + 1;
    await interaction.editReply({ content: datas?.error ? datas?.error : `処理中...(データ取得)\n作者名:${author}\n作品タイトル:${title}\n作品に込めた思い:${description}\n作品番号:${num}`, flags: 64 });
    const url = await gcp.save({ content: description, title: title, author: author, num: num, i: interaction });
    await interaction.editReply({ content: url?.error ? url?.error : `処理中...(データ保存)\n作者名:${author}\n作品タイトル:${title}\n作品に込めた思い:${description}\n作品番号:${num}`, flags: 64 });
    await gcp.set({ type: 'userdata', userId: interaction.user.id, userName: interaction.user.globalName, author: author, description: description, title: title, num: num, url: url });
    const imageUrl = globalThis.usertmp.get(interaction.user.id)[0]
    const res = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const ext = path.extname(new URL(imageUrl).pathname);
    const buffer = Buffer.from(res.data, 'binary');
    const attachment = new AttachmentBuilder(buffer, { name: `${title}${ext}` });
    const end_embed = new CustomEmbed()
      .setTitle(`✅${interaction.user.globalName}の投稿`)
      .setDescription(`作者名:${author}\n作品タイトル:${title}\n作品に込めた思い:${description}\n作品番号:${num}`)
      .setImage(`attachment://${title}${ext}`)
      .setColor(Colors.Green)
      .create();
    await interaction.editReply({ content: "", embeds: [end_embed], files: [attachment], flags: 64 });
    const guild = await interaction.client.guilds.fetch(setting.bot.serverid);
    const channel = guild.channels.cache.get(setting.bot.channelid);
    sendMessage({ interaction: interaction, content: end_embed, channel: channel, files: [attachment] });
    globalThis.usertmp.delete(interaction.user.id);
    const messageId = interaction.customId.split("_")[2];
    if (messageId) {
      const data = await interaction.channel.messages.fetch(messageId);
      await data.delete()
    }
  }
};
