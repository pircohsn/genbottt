const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const config = require("../config.json");
const CatLoggr = require("cat-loggr");

const log = new CatLoggr();
const generated = new Set();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("premium")
    .setDescription("Stok varsa belirli bir hizmet oluşturun")
    .addStringOption((option) =>
      option
        .setName("servis")
        .setDescription("Oluşturulacak hizmetin adı")
        .setRequired(true),
    ),

  async execute(interaction) {
    const service = interaction.options.getString("servis");
    const member = interaction.member;

    // Check if the channel where the command was used is the generator channel
    if (interaction.channelId !== config.premiumChannel) {
      const wrongChannelEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Yanlış komut kullanımı!")
        .setDescription(
          `Bu kanalda \`/premium\` komutunu kullanamazsınız! Deneyin<#
          ${config.premiumChannel}>!`,
        )
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();

      return interaction.reply({
        embeds: [wrongChannelEmbed],
        ephemeral: true,
      });
    }

    // Check if the user has cooldown on the command
    if (generated.has(member.id)) {
      const cooldownEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Cooldown!")
        .setDescription(
          `Lütfen bekleyin **${config.premiumCooldown}** bu komutu çalıştırmadan saniyeler önce 
Tekrar!`,
        )
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();

      return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
    }

    // File path to find the given service
    const filePath = `${__dirname}/../premium/${service}.txt`;

    // Read the service file
    fs.readFile(filePath, "utf-8", (error, data) => {
      if (error) {
        const notFoundEmbed = new MessageEmbed()
          .setColor(config.color.red)
          .setTitle("Jeneratör hatası!")
          .setDescription(`Servis \`${service}\`bulunmuyor!`)
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setTimestamp();

        return interaction.reply({ embeds: [notFoundEmbed], ephemeral: true });
      }

      const lines = data.split(/\r?\n/);

      if (lines.length <= 1) {
        const emptyServiceEmbed = new MessageEmbed()
          .setColor(config.color.red)
          .setTitle("jeneratör hata!")
          .setDescription(`The \`${service}\` servis boş!`)
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setTimestamp();

        return interaction.reply({
          embeds: [emptyServiceEmbed],
          ephemeral: true,
        });
      }

      const generatedAccount = lines[0];

      // Remove the redeemed account line
      lines.shift();
      const updatedData = lines.join("\n");

      // Write the updated data back to the file
      fs.writeFile(filePath, updatedData, (writeError) => {
        if (writeError) {
          log.error(writeError);
          return interaction.reply("Hesabı kullanırken bir hata oluştu.");
        }

        const embedMessage = new MessageEmbed()
          .setColor(config.color.green)
          .setTitle("HESABINIZ OLUŞTURULDU!")
          .setFooter(
            interaction.user.tag,
            interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
          )
          .setDescription(
            "🙏 Premium üye olduğunuz için çok teşekkür ederiz! \n 🌟 Desteğiniz bizim için dünyalara bedel! 💖😊",
          )
          .addField(
            "SERVİS",
            `\`\`\`${service[0].toUpperCase()}${service
              .slice(1)
              .toLowerCase()}\`\`\``,
            true,
          )
          .addField("HESAP", `\`\`\`${generatedAccount}\`\`\``, true)
          .setImage(config.banner)
          .setTimestamp();

        member
          .send({ embeds: [embedMessage] })
          .catch((error) =>
            console.error(`Error sending embed message: ${error}`),
          );
        interaction.reply({
          content: `**Dm'yi Kontrol Et ${member}!** __"Mesajı Kontrol Et Hediyemiz Var! <a:Siren:1222377201123725412>__`,
        });

        generated.add(member.id);
        setTimeout(() => {
          generated.delete(member.id);
        }, config.premiumCooldown * 1000);
      });
    });
  },
};
