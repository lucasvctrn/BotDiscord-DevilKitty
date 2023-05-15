const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Créer un nouveau vote')
		.addStringOption(option => 
			option.setName('question')
						.setDescription('Question du vote')
						.setRequired(true))
		.addRoleOption(option =>
			option.setName('role')
						.setDescription('Rôle à mentionner')
						.setRequired(false))
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
		const role = interaction.options.getRole('role');
		const options = interaction.options.getBoolean('options');
		const optiona = interaction.options.getString('optiona');
		const optionb = interaction.options.getString('optionb');
		const optionc = interaction.options.getString('optionc');
		const optiond = interaction.options.getString('optiond');
		const optione = interaction.options.getString('optione');

		console.log(`★ Question : ${question}`)

		if(options) {
			console.log('★ Vote avec options')

			// Création du message avec mention du rôle si il est renseigné
			let messageContent = role != null ? `@${role} Nouveau vote !\n\n**${question}**\n` : `Nouveau vote !\n\n**${question}**\n`;

			// Ajout des options au message
			if(optiona != null && optionb != null && optionc == null) {
				messageContent += `★ A - ${optiona}\n★ B - ${optionb}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧'));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond == null) {
				messageContent += `★ A - ${optiona}\n★ B - ${optionb}\n★ C - ${optionc}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨')));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond != null && optione == null) {
				messageContent += `★ A - ${optiona}\n★ B - ${optionb}\n★ C - ${optionc}\n★ D - ${optiond}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨').then(() => message.react('🇩'))));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond != null && optione != null) {
				messageContent += `★ A - ${optiona}\n★ B - ${optionb}\n★ C - ${optionc}\n★ D - ${optiond}\n★ E - ${optione}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨').then(() => message.react('🇩').then(() => message.react('🇪')))));
			}
			else {
				// Retourne une erreur à l'utilisateur si il n'a pas renseigné au moins deux options
				console.log('★ Commande annulée : l\'utilisateur n\'a pas renseigné au moins deux options.')
				return interaction.reply({ content: 'Erreur : Vous devez renseigner au moins deux options.', ephemeral: true });
			}
		}
		else {
			console.log('★ Vote sans options')
			// Création du message avec mention du rôle si il est renseigné
			let messageContent = role != null ? `@${role} Nouveau vote !\n\n**${question}**` : `Nouveau vote !\n\n**${question}**`;
			const message = await interaction.reply({ content: `**${question}**`, fetchReply: true });
			message.react('✅').then(() => message.react('❌'));
		}
	},
};