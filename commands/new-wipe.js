const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('new-wipe')
		.setDescription('Créer un nouveau wipe')
		.addStringOption(option => 
			option.setName('date')
						.setDescription('Date du wipe')
						.setRequired(true))
		.addBooleanOption(option =>
			option.setName('little-grouplimit')
						.setDescription('Mettre oui pour sélectionner un serveur avec un petit group-limit')
						.setRequired(false))
		.setDMPermission(false)
		.setDefaultMemberPermissions(0),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /new-wipe');
		// Liste des utilisateurs qui sont en train de répondre à l'heure de début de jeu
		let usersProcessingYes = [];

		// Listes des utilisateurs qui ont réagi avec les emojis
		let usersYes = [];
		let usersNotSure = [];
		let usersNo = [];

		// Map des utilisateurs présents dans la liste 'usersYes' avec l'heure de début de jeu
		const usersResponse = new Map();

		const wipeDate = interaction.options.getString('date');
		const wipeDay = interaction.options.getString('date').split(' ')[0];
		const littleGroupLimit = interaction.options.getBoolean('little-grouplimit');
		const message = await interaction.reply({ content: `------------------------------------------\n**${wipeDate}**`, fetchReply: true });

		console.log('\n★ Nouveau wipe prévu le : ' + wipeDate);

		message.react('✅').then(() => message.react('❓')).then(() => message.react('❌')).then(() => {
			const filter = (reaction, user) => {
				return ['✅', '❓', '❌'].includes(reaction.emoji.name) && !user.bot;
			};
	
			const collector = message.createReactionCollector(filter);
	
			collector.on('collect', async (reaction, user) => {
				// Récupère toutes les réactions de l'utilisateur
				const userReactions = message.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
	
				// Si l'utilisateur est déjà dans la liste 'usersProcessingYes', on ne tiens pas compte de sa réaction
				if (usersProcessingYes.includes(user.username))
				{
					for (const react of userReactions.values()) {
						if (reaction.emoji.name === react.emoji.name) {
							await react.users.remove(user.id);
							return;
						}
					}
				}
	
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
	
				// Supprime la précédente réponse de l'utilisateur sur l'heure de début de jeu
				if (usersResponse.has(user.username)) usersResponse.delete(user.username);
	
				// Ajoute le nom de l'utilisateur à la liste de réactions '✅'
				if (reaction.emoji.name === '✅') {
					console.log(user.username + ' a réagi avec l\'emoji ✅ pour le wipe du ' + wipeDate);
					usersProcessingYes.push(user.username);
	
					// Envoie un message privé à l'utilisateur pour qu'il puisse indiquer l'heure de début de jeu
					const message = await user.send(`À quelle heure tu commenceras à jouer pour le wipe du ${wipeDate} ? Réponds avec l'heure au format \`HH:MM\`, ou avec \`?\` si tu ne sais pas.`);
					const filter = async (response) => {
						let validate = response.author.id === user.id && (/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(response.content) || response.content === '?');
						if (response.author.id === user.id && !validate) await user.send('La réponse doit être au format `HH:MM`, ou répond avec `?` si tu ne sais pas à quelle heure tu vas jouer.');
						return validate;
					};
					const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
	
					// Ajoute la réponse de l'utilisateur à la map 'usersResponse'
					collector.on('collect', response => {
						console.log(user + ' a indiqué l\'heure de début de jeu : ' + userResponse + ' pour le wipe du ' + wipeDate);
						usersResponse.set(user.username, response.content);
						collector.stop();
					});
					
					// Si l'utilisateur n'a pas répondu à temps, on met '?' comme heure de début de jeu
					collector.on('end', async collected => {
						if (collected.size === 0) {
							console.log(user.username + ' n\'a pas répondu à temps pour l\'heure de début de jeu pour le wipe du ' + wipeDate)
							await user.send(`Tu n'as pas répondu à temps, je vais donc mettre \`?\` comme heure de début de jeu. Si tu veux changer ton heure de début de jeu, tu peux réagir à nouveau avec l'emoji ✅.`);
							usersResponse.set(user.username, '?');
						}
						usersProcessingYes.splice(usersProcessingYes.indexOf(user.username), 1);
						usersYes.push(user.username);
						updateMess();
					});
				} 
				
				// Ajoute le nom de l'utilisateur à la liste de réactions '❓'
				else if (reaction.emoji.name === '❓') {
					console.log(user.username + ' a réagi avec l\'emoji ❓ pour le wipe du ' + wipeDate)
					usersNotSure.push(user.username);
					updateMess();
				} 
				
				// Ajoute le nom de l'utilisateur à la liste de réactions '❌'
				else if (reaction.emoji.name === '❌') {
					console.log(user.username + ' a réagi avec l\'emoji ❌ pour le wipe du ' + wipeDate)
					usersNo.push(user.username);
					updateMess();
				}
	
				// Met à jour le message
				function updateMess() {
					let new_content = `------------------------------------------\n**${wipeDate}**`;
		
					if (usersYes.length > 0) {
						usersYes.sort((a, b) => {
							if (usersResponse.get(a) === '?') return 1;
							if (usersResponse.get(b) === '?') return -1;
							return usersResponse.get(a) > usersResponse.get(b) ? 1 : -1;
						});

						new_content += `\n\n✅ ${usersYes.map(user => `${user} - ${usersResponse.get(user)}`).join('\n✅ ')}`;
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

		// Création du fil de discussion pour le wipe
		const thread = await message.startThread({
			name: `${wipeDate}`,
			autoArchiveDuration: 60,
			reason: `Planification du wipe du ${wipeDate}`,
		});

		// Récupération des infos du serveur
		let rawdata = fs.readFileSync('wipes.json');
		let servers = (JSON.parse(rawdata)).servers;
		let selectedServer;
		for (let server of servers) {
			for(let wipe of server.wipes) {
				if (wipe.day === wipeDay) {
					if(littleGroupLimit) {
						if(server.group_limit < 8 && server.group_limit > 0) {
							selectedServer = server;
							break;
						}
					}
					else {
						if(server.group_limit >= 8 || server.group_limit == 0) {
							selectedServer = server;
							break;
						}
					}
				}
			}
			if(selectedServer) break;
		}

		// Envoie les infos du serveur dans le fil de discussion
		if(selectedServer) {
			let wipeType = selectedServer.wipes.find(wipe => wipe.day === wipeDay).type;
			let groupLimit = selectedServer.group_limit == 0 ? "No Group Limit" : `Group Limit ${selectedServer.group_limit}`;
			const teamDKRole = message.guild.roles.cache.find(role => role.name === 'Team DK');
			thread.send(`<@&${teamDKRole.id}> Voici le fil dédié au wipe du ${wipeDate} avec les informations du serveur.\n\n**${selectedServer.name}**\n★ ${wipeType === "FullWipe" ? wipeType : `${wipeType}, à vérifier ici : https://survivors.gg/#wipe` }\n★ ${groupLimit}\n★ connect ${selectedServer.ip}\n★ ${selectedServer.battlemetrics}`);
		}
	},
};