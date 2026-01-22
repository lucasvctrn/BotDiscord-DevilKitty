const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('vote')
		.setDescription('Créé un nouveau vote, en mentionnant un rôle et avec différentes propositions de réponses')
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
		.setDMPermission(false),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /vote');

		// Vérifie que l'utilisateur qui a appelé la commande est bien membre du rôle "⚜️ Team DK ⚜️" ou "🕹️ Teammate 🕹️"
		if (!interaction.member.roles.cache.some(role => role.name === '⚜️ Team DK ⚜️' || role.name === '🕹️ Teammate 🕹️')) 
		{
			// Si l'utilisateur n'est pas membre du rôle "⚜️ Team DK ⚜️" ou "🕹️ Teammate 🕹️", on envoie un message d'erreur
			console.log('\n★ Commande annulée : /vote (l\'utilisateur n\'est pas membre du rôle ⚜️ Team DK ⚜️ ou 🕹️ Teammate 🕹️)');
			return interaction.reply({ content: `Vous n'avez pas la permission d'utiliser cette commande.`, ephemeral: true });
		}

		const question = interaction.options.getString('question');
		const role = interaction.options.getRole('role');
		const options = interaction.options.getBoolean('options');
		const optiona = interaction.options.getString('optiona');
		const optionb = interaction.options.getString('optionb');
		const optionc = interaction.options.getString('optionc');
		const optiond = interaction.options.getString('optiond');
		const optione = interaction.options.getString('optione');

		console.log(`Question : ${question}`);

		if(options) {
			// Création du message avec mention du rôle si il est renseigné
			let messageContent = role != null ? `${role} Nouveau vote !\n\n**${question}**\n` : `Nouveau vote !\n\n**${question}**\n`;

			// Ajout des options au message
			if(optiona != null && optionb != null && optionc == null) {
				console.log('Vote avec options A et B : \"' + optiona + '\" et \"' + optionb + '\"');
				messageContent += `★ A - ${optiona}\n★ B - ${optionb}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧'));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond == null) {
				console.log('Vote avec options A, B et C : \"' + optiona + '\", \"' + optionb + '\" et \"' + optionc + '\"');
				messageContent += `★ A - ${optiona}\n★ B - ${optionb}\n★ C - ${optionc}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨')));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond != null && optione == null) {
				console.log('Vote avec options A, B, C et D : \"' + optiona + '\", \"' + optionb + '\", \"' + optionc + '\" et \"' + optiond + '\"');
				messageContent += `★ A - ${optiona}\n★ B - ${optionb}\n★ C - ${optionc}\n★ D - ${optiond}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨').then(() => message.react('🇩'))));
			}
			else if(optiona != null && optionb != null && optionc != null && optiond != null && optione != null) {
				console.log('Vote avec options A, B, C, D et E : \"' + optiona + '\", \"' + optionb + '\", \"' + optionc + '\", \"' + optiond + '\" et \"' + optione + '\"');
				messageContent += `★ A - ${optiona}\n★ B - ${optionb}\n★ C - ${optionc}\n★ D - ${optiond}\n★ E - ${optione}`;
				const message = await interaction.reply({ content: messageContent, fetchReply: true });
				message.react('🇦').then(() => message.react('🇧').then(() => message.react('🇨').then(() => message.react('🇩').then(() => message.react('🇪')))));
			}
			else {
				// Retourne une erreur à l'utilisateur si il n'a pas renseigné au moins deux options
				console.log('Commande annulée : l\'utilisateur n\'a pas renseigné au moins deux options.');
				return interaction.reply({ content: 'Erreur : Vous devez renseigner au moins deux options.', ephemeral: true });
			}
		}
		else {
			console.log('Vote sans options');
			// Création du message avec mention du rôle si il est renseigné
			let messageContent = role != null ? `${role} Nouveau vote !\n\n**${question}**` : `Nouveau vote !\n\n**${question}**`;
			const message = await interaction.reply({ content: messageContent, fetchReply: true });
			message.react('✅').then(() => message.react('❌'));
		}
	},
};