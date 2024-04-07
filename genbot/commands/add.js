const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs");
const os = require("os");
const config = require("../config.json");
const CatLoggr = require("cat-loggr");

const log = new CatLoggr();

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ekle")
    .setDescription("Bir hizmete hesap ekleme.")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Hizmet türü (ücretsiz veya premium))")
        .setRequired(true)
        .addChoices(
          { name: "Ücretsiz", value: "ücretsiz" },
          { name: "Premium", value: "premium" },
        ),
    )
    .addStringOption((option) =>
      option
        .setName("servis")
        .setDescription("Hesabın ekleneceği hizmet")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("hesap")
        .setDescription("Hesabın ekleneceği hizmet")
        .setRequired(true),
    ),

  async execute(interaction) {
    const service = interaction.options.getString("servis");
    const account = interaction.options.getString("hesap");
    const type = interaction.options.getString("type");

    if (!interaction.member.permissions.has("MANAGE_CHANNELS")) {
      const errorEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("İzniniz Yok!")
        .setDescription("🛑 Sadece Yönetici Yapabilir HEHE")
        .setFooter(
          interaction.user.tag,
          interaction.user.displayAvatarURL({ dynamic: true, size: 64 }),
        )
        .setTimestamp();
      return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }

    if (!service || !account || (type !== "ücretsiz" && type !== "premium")) {
      const missingParamsEmbed = new MessageEmbed()
        .setColor(config.color.red)
        .setTitle("Eksik parametreler veya geçersiz tür!")
        .setDescription(
          "Bir hizmet, hesap ve geçerli bir tür (ücretsiz veya premium) belirtmeniz gerekiyor!",
        )
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
    }

    fs.appendFile(filePath, `${os.EOL}${account}`, function (error) {
      if (error) {
        log.error(error);
        return interaction.reply("Hesap eklenirken bir hata oluştu.");
      }

      const successEmbed = new MessageEmbed()
        .setColor(config.color.green)
        .setTitle("Hesap eklendi!")
        .setDescription(
          `Başarıyla Eklendi \`${account}\` hesap vermek \`${service}\` servis **${type}**.`,
        )
        .setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
        .setTimestamp();

      interaction.reply({ embeds: [successEmbed], ephemeral: true });
    });
  },
};
