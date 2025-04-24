const {
  ModalBuilder,
  TextInputStyle,
  TextInputBuilder,
  ActionRowBuilder
} = require("discord.js");


module.exports = {
  builder: (builder) =>
    builder
      .setName("post")
      .setDescription("世界牛乳チャレンジの応募")
      .addAttachmentOption(option => option.setName('image1').setDescription("応募画像の添付")
        .setRequired(true))
      .addAttachmentOption(option => option.setName('image2').setDescription("応募画像の添付(サブ画像)"))
      .addAttachmentOption(option => option.setName('image3').setDescription("応募画像の添付(サブ画像)"))
  ,

  async execute(interaction) {
    globalThis.usertmp.delete(interaction.user.id)
    const attachment_1 = interaction.options.getAttachment('image1');
    const attachment_2 = interaction.options.getAttachment('image2');
    const attachment_3 = interaction.options.getAttachment('image3');
    globalThis.usertmp.set(interaction.user.id, [attachment_1.url, attachment_2?.url, attachment_3?.url]);
    const submission_modal = new ModalBuilder()
      .setCustomId("submission_modal")
      .setTitle("質問内容を入力してください");
    const author_Input = new TextInputBuilder()
      .setCustomId("author")
      .setLabel("作者名")
      .setMinLength(1)
      .setMaxLength(15)
      .setValue(interaction.user.globalName)
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
    const description_Input = new TextInputBuilder()
      .setCustomId("description")
      .setLabel("作品に込めた思い")
      .setMinLength(1)
      .setPlaceholder("食卓に毎日届く牛乳の背景にある「命の営み」や「生産者の愛情と努力」")
      .setRequired(true)
      .setStyle(TextInputStyle.Paragraph);

    const author_Row = new ActionRowBuilder().addComponents(author_Input)
    const title_Row = new ActionRowBuilder().addComponents(title_Input)
    const description_Row = new ActionRowBuilder().addComponents(description_Input);
    submission_modal.addComponents(author_Row, title_Row, description_Row);
    await interaction.showModal(submission_modal);
  },
};
