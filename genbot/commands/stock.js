const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const fs = require("fs").promises;
const config = require("../config.json");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stok")
    .setDescription("Hizmet stoğunu görüntüle."),

  async execute(interaction) {
    const ücretsizStock = await getStock(`${__dirname}/../ücretsiz/`);
    const premiumStock = await getStock(`${__dirname}/../premium/`);

    const embed = new MessageEmbed()
      .setColor(config.color.default)
      .setTitle(`${interaction.guild.name} servis Stoku`)
      .setDescription(
        `👋 Hello and welcome to **${interaction.guild.name}**! 🌟 We are here to provide you with the best services. 🚀`,
      )
      .setFooter(config.footer)
      .setImage(config.banner);

    if (ücretsizStocks.length > 0) {
      const ücretsizStockInfo = await getServiceInfo(
        `${__dirname}/../free/`,
        ücretsizStock,
      );
      embed.addField("ÜCRETSİZ SERVİS ", freeStockInfo, true);
    }

    if (premiumStock.length > 0) {
      const premiumStockInfo = await getServiceInfo(
        `${__dirname}/../premium/`,
        premiumStock,
      );
      embed.addField("PREMİUM SERVİS", premiumStockInfo, true);
    }

    embed.addField(
      "BAĞLANTILAR",
      `[**Website**](${config.website}) [**Discord**](https://discord.gg/dijitalstore)`,
    );

    interaction.reply({ embeds: [embed] });
  },
};

async function getStock(directory) {
  try {
    const files = await fs.readdir(directory);

    const stock = files.filter((file) => file.endsWith(".txt"));
    return stock;
  } catch (err) {
    console.error("Unable to scan directory: " + err);
    return [];
  }
}

async function getServiceInfo(directory, stock) {
  const info = [];
  for (const service of stock) {
    const serviceContent = await fs.readFile(
      `${directory}/${service}`,
      "utf-8",
    );
    const lines = serviceContent.split(/\r?\n/);
    info.push(`**${service.replace(".txt", "")}:** \`${lines.length}\``);
  }
  return info.join("\n");
}
