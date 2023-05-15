const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('new-shooting')
		.setDescription('Créer un nouveau tournage')
		.addStringOption(option => 
			option.setName('date')
						.setDescription('Date du tournage')
						.setRequired(true))
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /new-shooting');

		// Vérifie que l'utilisateur qui a appelé la commande est bien membre du rôle "⚜️ Team DK ⚜️"
		if (!interaction.member.roles.cache.some(role => role.name === '⚜️ Team DK ⚜️')) 
		{
			// Si l'utilisateur n'est pas membre du rôle "⚜️ Team DK ⚜️", on envoie un message d'erreur
			console.log('\n★ Commande annulée : /day-wipes (l\'utilisateur n\'est pas membre du rôle ⚜️ Team DK ⚜️)');
			return interaction.reply({ content: `Vous n'avez pas la permission d'utiliser cette commande.`, ephemeral: true });
		}

		// Listes des utilisateurs qui ont réagi avec les emojis
		let usersYes = [];
		let usersNotSure = [];
		let usersNo = [];

		const shootingDate = interaction.options.getString('date');
		const message = await interaction.reply({ content: `**${shootingDate}**`, fetchReply: true });

		console.log('\n★ Nouveau tournage prévu le : ' + shootingDate);

		message.react('✅').then(() => message.react('❓')).then(() => message.react('❌')).then(() => {
			const filter = (reaction, user) => {
				return ['✅', '❓', '❌'].includes(reaction.emoji.name) && !user.bot;
			};
	
			const collector = message.createReactionCollector(filter);
	
			collector.on('collect', async (reaction, user) => {
				// Récupère toutes les réactions de l'utilisateur
				const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
	
				// Supprime toutes les réactions de l'utilisateur sauf celle qu'il vient de faire
				for (const react of userReactions.values()) {
					if (reaction.emoji.name !== react.emoji.name) {
						await react.users.remove(user.id);
					}
				}
	
				// Supprime le nom de l'utilisateur des liste de réactions
				if (usersYes.includes(user.username)) usersYes.splice(usersYes.indexOf(user.username), 1);
				if (usersNotSure.includes(user.username)) usersNotSure.splice(usersNotSure.indexOf(user.username), 1);
				if (usersNo.includes(user.username)) usersNo.splice(usersNo.indexOf(user.username), 1);
	
				// Ajoute le nom de l'utilisateur à la liste de réactions '✅'
				if (reaction.emoji.name === '✅') {
					console.log(user.username + ' a réagi avec l\'emoji ✅ pour le shooting du ' + shootingDate);
					usersYes.push(user.username);
					updateMess();
				} 
				
				// Ajoute le nom de l'utilisateur à la liste de réactions '❓'
				else if (reaction.emoji.name === '❓') {
					console.log(user.username + ' a réagi avec l\'emoji ❓ pour le shooting du ' + shootingDate)
					usersNotSure.push(user.username);
					updateMess();
				} 
				
				// Ajoute le nom de l'utilisateur à la liste de réactions '❌'
				else if (reaction.emoji.name === '❌') {
					console.log(user.username + ' a réagi avec l\'emoji ❌ pour le shooting du ' + shootingDate)
					usersNo.push(user.username);
					updateMess();
				}
	
				// Met à jour le message
				function updateMess() {
					let new_content = `**${shootingDate}**`;
		
					if (usersYes.length > 0) {
						new_content += `\n\n✅ ${usersYes.join('\n✅ ')}`;
					}
		
					if (usersNotSure.length > 0) {
						new_content += `\n\n❓ ${usersNotSure.join('\n❓ ')}`;
					}
		
					if (usersNo.length > 0) {
						new_content += `\n\n❌ ${usersNo.join('\n❌ ')}`;
					}
					
					message.edit({ content: new_content });
				}
			});
		});

		// Création du fil de discussion pour le shooting
		const thread = await message.startThread({
			name: `${shootingDate}`,
			autoArchiveDuration: 60,
			reason: `Planification du tournage du ${shootingDate}`,
		});

		// Modification de la durée d'archivage automatique du fil de discussion (10 080 minutes = 7 jours)
		thread.setAutoArchiveDuration(10080);

		// Envoie les infos du serveur dans le fil de discussion
		let serverIp = "play.clanpains.fr:25051";
		const teamDKRole = message.guild.roles.cache.find(role => role.name === '⚜️ Team DK ⚜️');
		thread.send(`<@&${teamDKRole.id}> Voici le fil dédié au tournage du ${shootingDate}.\n\n★ Commande pour se connecter au serveur privé : \`\`\`connect ${serverIp}\`\`\``);
	},
};