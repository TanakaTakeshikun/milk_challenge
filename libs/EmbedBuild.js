const { Colors, EmbedBuilder } = require('discord.js');
const setting = require('../setting.json');

class CustomEmbed extends EmbedBuilder {
  constructor(text) {
    super();
    this.setFooter({
      text: setting.bot.embed.Footer.CR
    });
    this.date = new Date()
  }
  typeSuccess() {
    this.setTitle('✅成功');
    this.setColor(Colors.Green);
    return this;
  }
  typeError() {
    this.setTitle('⚠エラー');
    this.setColor(Colors.Red);
    return this;
  }
  toJSON() {
    if (!this.data.timestamp) this.setTimestamp();
    return super.toJSON();
  }

  setTimestamp(timestamp = Date.now()) {
    this.date = timestamp;
    return this;
  }
setImage(url){
  this.Image = url;
  return this;
}
  setColor(color) {
    this.color = color;
    return this;
  }
  setTitle(title) {
    this.title = title;
    return this;
  }
  setThumbnail(thumbnail) {
    this.thumbnail = thumbnail;
    return this;
  }
  setURL(url) {
    this.url = url;
    return this;
  }
  setAuthor(data) {
    //ex { name: 'Some name', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' }
    this.author = data;
    return this;
  }
  setDescription(text) {
    this.description = text;
    return this;
  }
  addFields(fields) {
    //ex
    // { name: 'Regular field title', value: 'Some value here' },
    // { name: '\u200B', value: '\u200B' },
    // { name: 'Inline field title', value: 'Some value here', inline: true },
    // { name: 'Inline field title', value: 'Some value here', inline: true },
    this.fields = fields;
    return this;
  }

  create() {
    const embed = new EmbedBuilder()
    if (this.color) embed.setColor(this.color);
    if (this.title) embed.setTitle(this.title);
    if (this.url) embed.setURL(this.url);
    if (this.author) embed.setAuthor(this.author)
    if (this.description) embed.setDescription(this.description);
    if (this.thumbnail) embed.setThumbnail(this.thumbnail);
    if (this.fields) embed.addFields(this.fields);
    if (this.date) embed.setTimestamp(this.date);
    if (this.Image) embed.setImage(this.Image);
    embed.setFooter(this.data.footer)
    return embed;
  }
}


module.exports = {
  CustomEmbed
};