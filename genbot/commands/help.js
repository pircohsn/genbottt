const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const config = require("../config.json");
const stock = require("./stock");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Display the command list."),

  async execute(interaction) {
    const { commands } = interaction.client;

    const commandListEmbed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle("Help Panel")
      .setDescription(
        `👋Merhaba, **${interaction.guild.name}**'e hoş geldiniz! 🌟Size en iyi hizmeti sunmak için buradayız. 🚀`,
      )
      .setImage(config.banner)
      .setThumbnail(
        interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 }),
      ) // Set the bot's avatar as the thumbnail
      .addFields({
        name: `KOMUTLAR`,
        value:
          "`/help` **Yardım komutunu görüntüler**\n`/oluştur` **Yeni bir hizmet oluşturun**\n`/ücretsiz` **Ödül oluşturun**\n`/ekle` **Bir hizmet ekleyin hisse senedine ödül**\n`/stok` **Mevcut hisse senedini görüntüle**\n`/premium` **Premium ödülü oluştur**",
      })
      .setFooter(
        interaction.user.tag,
        interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
      )
      .setTimestamp()
      .addField(
        "BAĞLANTILAR",
        `[**Website**](${config.website}) [**Discord**](https://discord.gg/dijitalstore)`,
      );

    await interaction.reply({ embeds: [commandListEmbed] });
  },
};
