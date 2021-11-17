const Discord = require('discord.js');

/**
 * 
 * @param {Discord.CommandInteraction} interaction 
 * @param {Discord.MessageEmbedOptions} embedOptions 
 */
module.exports = (interaction, embedOptions) => {
  const {
    title,
    description,
    timestamp = false,
    color,
    fields,
    author,
    thumbnail,
    image,
    footer,    
  } = embedOptions;

  const embed = new Discord.MessageEmbed();

  if (title) embed.setTitle(title);
  if (description) embed.setDescription(description);
  if (timestamp) embed.setTimestamp();
  if (color) {
    embed.setColor(color);
  } else {
    embed.setColor('WHITE')
  };
  if (fields) {
    for (const field of fields) {
      embed.addField(field.name, field.value, field.inline ? true : false);
    }
  };
  if (author) {
    embed.setAuthor(author.name ? author.name : '', author.iconURL ? author.iconURL : '', author.url ? author.url : '');
  } else {
    embed.setAuthor(interaction.user.username, interaction.user.displayAvatarURL({ dynamic: true }));
  }
  if (thumbnail) embed.setThumbnail(thumbnail.url)
  if (image) embed.setImage(image.url);
  if (footer) embed.setFooter(footer.text ? footer.text : '', footer.iconURL ? footer.iconURL : '');

  return embed;
};