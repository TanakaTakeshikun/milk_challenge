const { Events, ModalBuilder, TextInputStyle, TextInputBuilder, ActionRowBuilder } = require('discord.js');
const fieldMap = {
  '作者名': 'author',
  '作品タイトル': 'title',
  '作品に込めた思い': 'description'
};
module.exports = {
  name: Events.InteractionCreate,
  filter: (i) => i.isButton() && i.customId.startsWith('confirm') && i.channel.type === 1,
  async execute(interaction) {
    globalThis.usertmp.delete(interaction.user.id);
    const messageId = interaction.customId.split("_")[1];
    const data = await interaction.channel.messages.fetch(messageId);
    const embed = data.embeds[0];
    const content = embed.description;
    const result = Object.fromEntries(
      content
        .trim()
        .split('\n')
        .map(line => line.split(/[:：]/))
        .filter(([key]) => fieldMap[key])
        .map(([key, value]) => [fieldMap[key], value.trim()])
    );
    globalThis.usertmp.set(interaction.user.id, data.attachments.map(x => x.url));
    const submission_modal = new ModalBuilder()
      .setCustomId(`submission_modal_${data.id}`)
      .setTitle("質問内容を入力してください");
    const author_Input = new TextInputBuilder()
      .setCustomId("author")
      .setLabel("作者名")
      .setMinLength(1)
      .setMaxLength(15)
      .setValue(result.author || interaction.user.globalName)
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
    const title_Input = new TextInputBuilder()
      .setCustomId("title")
      .setLabel("作品名")
      .setMinLength(1)
      .setMaxLength(20)
      .setPlaceholder("ミルクの約束")
      .setRequired(true)
      .setStyle(TextInputStyle.Short);
    if (result.title) title_Input.setValue(result.title);
    const description_Input = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("作品に込めた思い")
      .setMinLength(1)
      .setPlaceholder("食卓に毎日届く牛乳の背景にある「命の営み」や「生産者の愛情と努力」")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);
    if (result.description) description_Input.setValue(result.description);
    const author_Row = new ActionRowBuilder().addComponents(author_Input)
    const title_Row = new ActionRowBuilder().addComponents(title_Input)
    const description_Row = new ActionRowBuilder().addComponents(description_Input);
    submission_modal.addComponents(author_Row, title_Row, description_Row);
    await interaction.showModal(submission_modal);
  }
};
