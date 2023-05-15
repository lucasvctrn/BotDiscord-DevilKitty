const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Créer un nouveau vote')
		.addStringOption(option => 
			option.setName('question')
						.setDescription('Question du vote')
						.setRequired(true))
		.addBooleanOption(option =>
			option.setName('options')
						.setDescription('Propose une liste d\'options au lieu de oui ou non')
						.setRequired(false))
		.addStringOption(option => 
			option.setName('optiona')
						.setDescription('Option A du vote')
						.setRequired(false))
		.addStringOption(option => 
			option.setName('optionb')
						.setDescription('Option B du vote')
						.setRequired(false))
		.addStringOption(option => 
			option.setName('optionc')
						.setDescription('Option C du vote')
						.setRequired(false))
		.addStringOption(option => 
			option.setName('optiond')
						.setDescription('Option D du vote')
						.setRequired(false))
		.addStringOption(option => 
			option.setName('optione')
						.setDescription('Option E du vote')
						.setRequired(false))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /vote');

		const question = interaction.options.getString('question');
		const options = interaction.options.getBoolean('options');
		const optiona = interaction.options.getString('optiona');
		const optionb = interaction.options.getString('optionb');

		if(options) {
			let messageContent = `**${question}**\n`;
			if(optiona != null && optionb != null && optionc == null) {
				messageContent += `★ ${optiona}\n★ ${optionb}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧'));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond == null) {
				messageContent += `★ ${optiona}\n★ ${optionb}\n★ ${optionc}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨')));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond != null && optione == null) {
				messageContent += `★ ${optiona}\n★ ${optionb}\n★ ${optionc}\n★ ${optiond}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨').then(() => message.react('🇩'))));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond != null && optione != null) {
				messageContent += `★ ${optiona}\n★ ${optionb}\n★ ${optionc}\n★ ${optiond}\n★ ${optione}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨').then(() => message.react('🇩').then(() => message.react('🇪')))));
			}
			else {
				// Retourne une erreur à l'utilisateur si il n'a pas renseigné au moins deux options
				return interaction.reply({ content: 'Erreur : Vous devez renseigner au moins deux options.', ephemeral: true });
			}
		}
		else {
			const message = await interaction.reply({ content: `**${question}**`, fetchReply: true });
			message.react('✅').then(() => message.react('❌'));
		}
	},
};