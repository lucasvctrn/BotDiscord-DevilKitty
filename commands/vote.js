const { SlashCommandBuilder } = require('discord.js');

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
						.setDescription('Propose A ou B au lieu de oui ou non')
						.setRequired(false))
		.addStringOption(option => 
			option.setName('optiona')
						.setDescription('Option A du vote')
						.setRequired(false))
		.addStringOption(option => 
			option.setName('optionb')
						.setDescription('Option B du vote')
						.setRequired(false))
		.setDMPermission(false),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /vote');

		const question = interaction.options.getString('question');
		const options = interaction.options.getBoolean('options');
		const optiona = interaction.options.getString('optiona');
		const optionb = interaction.options.getString('optionb');

		if(options) {
			const message = await interaction.reply({ content: `**${question}**\n★ ${optiona}\n★ ${optionb}`, fetchReply: true });
			message.react('🇦').then(() => message.react('🇧'));	
		}
		else {
			const message = await interaction.reply({ content: `**${question}**`, fetchReply: true });
			message.react('✅').then(() => message.react('❌'));
		}
	},
};