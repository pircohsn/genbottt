const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs/promises");
const config = require("../config.json");
const CatLoggr = require("cat-loggr");

const log = new CatLoggr();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oluştur")
    .setDescription("Yeni bir hizmet oluştur.")
    .addStringOption((option) =>
      option
        .setName("servis")
        .setDescription("Oluşturulacak hizmetin adı")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Hizmet türü (ücretsiz veya premium)")
        .setRequired(true)
        .addChoices(
          { name: "ücretsiz", value: "ücretsiz" },
          { name: "Premium", value: "premium" },
        ),
    ),

  async execute(interaction) {
    const service = interaction.options.getString("servis");
    const type = interaction.options.getString("type");

    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      const errorEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("İzniniz Yok!")
        .setDescription("🛑 Sadece Yönetici Yapabilir")
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!service) {
      const missingParamsEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Eksik parametreler!")
        .setDescription("Bir hizmet adı belirtmeniz gerekiyor!")
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();
      return interaction.reply({
        embeds: [missingParamsEmbed],
        ephemeral: true,
      });
    }

    let filePath;
    if (type === "ücretsiz") {
      filePath = `${__dirname}/../ücretsiz/${service}.txt`;
    } else if (type === "premium") {
      filePath = `${__dirname}/../premium/${service}.txt`;
    } else {
      const invalidTypeEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Geçersiz hizmet türü!")
        .setDescription('Hizmet türü "ücretsiz" veya "premium" olmalıdır".')
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();
      return interaction.reply({ embeds: [invalidTypeEmbed], ephemeral: true });
    }

    try {
      await fs.writeFile(filePath, "");
      const successEmbed = new MessageEmbed()
        .setColor(config.color.green)
        .setTitle("Hizmet oluşturuldu!")
        .setDescription(
          `Yeni servis **${type}** \`${service}\` servis oluşturuldu!`,
        )
        .setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
        .setTimestamp();

      interaction.reply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
      log.error(error);
      return interaction.reply("servis oluşturulurken bir hata oluştu.");
    }
  },
};
