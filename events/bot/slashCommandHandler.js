const { Events, Colors } = require('discord.js');
const { CustomEmbed } = require('../../libs');
const permissions_embed = new CustomEmbed()
    .setTitle('⚠️エラー')
    .setDescription('権限が足りません。\nBOTに権限を与えてください')
    .setColor(Colors.Red)
    .create();
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            };
        } else {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction);
            } catch (err) {
                if (err.message === 'Missing Permissions') return await interaction.reply({ embeds: [permissions_embed], flags: 'Ephemeral' }).catch(() => { });
                console.error(err);
                const unknown_embed = new CustomEmbed()
                    .setTitle('⚠️エラー')
                    .setDescription(`不明なエラーが発生しました。\n詳細:${err.message}\n運営に問い合わせていただけると幸いです。`)
                    .setColor(Colors.Red)
                    .create();
                await interaction?.reply({ embeds: [unknown_embed], flags: 'Ephemeral' }).catch(() => { });
            };
        }
    }
};