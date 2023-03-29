const { Events } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {

		// On envoi un messagePlanif dans la console pour indiquer que le bot est en préparation
		console.log('Préparation du bot...\n');

		// On récupère le salon "attribution-roles" et on cherche si un message a déjà été envoyé dans le salon
		let channelAttRoleName = 'attribution-roles', messageAttRole;
		const channelAttRole = client.channels.cache.find(channelAttRole => channelAttRole.name === channelAttRoleName);
		const messagesAttRole = await channelAttRole.messages.fetch();

		// Si un message a déjà été envoyé, on ne crée pas de nouveau message mais on récupère le premier message du salon "attribution-roles"
		if (messagesAttRole.size > 0) {
			console.log('Un message a déjà été envoyé dans le salon "attribution-roles", récupération du message...');
			messageAttRole = messagesAttRole.first();
			collectAttRoleUserReactions();
		}
		// Sinon, on envoie un nouveau message dans le salon "attribution-roles"
		else {
			console.log('Aucun message n\'a été envoyé dans le salon "attribution-roles", envoi d\'un nouveau message...');
			messageAttRole = await channelAttRole.send({content: '**Réagis à ce messageAttRole** pour t\'attribuer des rôles et accéder aux salons réservés !\n\n🗿 : rejoins la Team DK sur Rust avec cet emoji de chad.\n🚿 : rejoins la Team Transpi sur LoL avec cet emoji odieux.', fetchReply: true });
			// On ajoute les réactions au messageAttRole
			messageAttRole.react('🗿').then(() => messageAttRole.react('🚿')).then(() => {
				collectAttRoleUserReactions();
			});
			console.log('Message envoyé !\n');
		}
	
		function collectAttRoleUserReactions() {
			const filter = (reaction, user) => {
				return ['🗿', '🚿'].includes(reaction.emoji.name) && !user.bot;
			};
	
			// On crée un collecteur qui récupère les réactions des utilisateurs
			const collector = messageAttRole.createReactionCollector(filter);
	
			collector.on('collect', (reaction, user) => {
				// Si l'utilisateur a réagi avec l'émote 🗿, on lui attribue le rôle "Team DK"
				if (reaction.emoji.name === '🗿') {
					console.log('L\'utilisateur ' + user.username + ' a réagi avec l\'émote 🗿, attribution du rôle "Team DK"...')
					const role = messageAttRole.guild.roles.cache.find(role => role.name === 'Team DK');
					const member = messageAttRole.guild.members.cache.find(member => member.id === user.id);
					member.roles.add(role);
				}
				// Si l'utilisateur a réagi avec l'émote 🚿, on lui attribue le rôle "Team Transpi"
				else if (reaction.emoji.name === '🚿') {
					console.log('L\'utilisateur ' + user.username + ' a réagi avec l\'émote 🚿, attribution du rôle "Team Transpi"...')
					const role = messageAttRole.guild.roles.cache.find(role => role.name === 'Team Transpi');
					const member = messageAttRole.guild.members.cache.find(member => member.id === user.id);
					member.roles.add(role);
				}
			});
			console.log('Message récupéré !\n');
		};

		// On récupère le salon "planifs-wipes" et on cherche si des messages de planifs ont déjà été envoyés dans le salon
		let channelPlanifWipesName = 'planifs-wipes';
		const channelPlanifWipes = client.channels.cache.find(channelPlanifWipes => channelPlanifWipes.name === channelPlanifWipesName);
		const messagesPlanifWipes = await channelPlanifWipes.messages.fetch();

		// Si des messages de planifs ont déjà été envoyés, on créé un collecteur pour chaque message pour récupérer les réactions des utilisateurs
		if (messagesPlanifWipes.size > 0) {
			console.log('Des messages de planifs de wipes ont déjà été envoyés dans le salon "planifs-wipes", récupération des messages...');
			for(const messagePlanif of messagesPlanifWipes.values()) {
				// Si le message est vide, on passe au message suivant
				if(messagePlanif.content === undefined) continue;
				
				// Si la première ligne du message est "__**Prochains wipes**__", on passe au message suivant
				if (messagePlanif.content.startsWith('__**Prochains wipes**__')) continue;

				// Liste des utilisateurs qui sont en train de répondre à l'heure de début de jeu
				let usersProcessingYes = [];

				// Listes des utilisateurs qui ont réagi avec les emojis
				let usersYes = [];
				let usersNotSure = [];
				let usersNo = [];

				// Map des utilisateurs présents dans la liste 'usersYes' avec l'heure de début de jeu
				const usersResponse = new Map();

				// On lit le messagePlanif pour récupérer la date de wipe et on supprime les '**'
				const messageContent = messagePlanif.content;
				const messageContentSplit = messageContent.split('\n');
				const wipeDate = messageContentSplit[1].slice(2, messageContentSplit[1].length - 2);
				console.log('\n★ Date de wipe : ' + wipeDate);

				// On récupère les utilisateurs qui ont réagi avec les emojis et on les ajoute dans les listes correspondantes
				for(const reaction of messagePlanif.reactions.cache.values()) {
					const users = await reaction.users.fetch();
					for(const user of users.values()) {
						if (!user.bot) {
							if (reaction.emoji.name === '✅') {
								console.log(user.username + ' a réagi avec l\'emoji ✅');
								usersYes.push(user.username);
							}
							else if (reaction.emoji.name === '❓') {
								console.log(user.username + ' a réagi avec l\'emoji ❓');
								usersNotSure.push(user.username);
							}
							else if (reaction.emoji.name === '❌') {
								console.log(user.username + ' a réagi avec l\'emoji ❌');
								usersNo.push(user.username);
							}
						}
					};
				};

				// On cherche les lignes qui contiennent les noms des utilisateurs qui ont réagi avec l'emoji '✅' et on récupère l'heure de début de jeu
				const messageUsersHoursSplit = messagePlanif.content.split('\n');
				for(const line of messageUsersHoursSplit.values()) {
					if (line.includes(' - ')) {
						const user = line.split(' - ')[0].slice(2);
						if(usersYes.includes(user))
						{
							const userResponse = line.split(' - ')[1];
							console.log(user + ' a indiqué comme heure de début de jeu ' + userResponse);
							usersResponse.set(user, userResponse);
						}
					}
				};

				updateMess();

				const filter = (reaction, user) => {
					return ['✅', '❓', '❌'].includes(reaction.emoji.name) && !user.bot;
				};
		
				const collector = messagePlanif.createReactionCollector(filter);
		
				collector.on('collect', async (reaction, user) => {
					// Récupère toutes les réactions de l'utilisateur
					const userReactions = messagePlanif.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
		
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
		
						// Envoie un messagePlanif privé à l'utilisateur pour qu'il puisse indiquer l'heure de début de jeu
						const messagePlanif = await user.send(`À quelle heure tu commenceras à jouer pour le wipe du ${wipeDate} ? Réponds avec l'heure au format \`HH:MM\`, ou avec \`?\` si tu ne sais pas.`);
						const filter = async (response) => {
							let validate = response.author.id === user.id && (/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(response.content) || response.content === '?');
							if (response.author.id === user.id && !validate) await user.send('La réponse doit être au format `HH:MM`, ou répond avec `?` si tu ne sais pas à quelle heure tu vas jouer.');
							return validate;
						};
						const collector = messagePlanif.channel.createMessageCollector({ filter, max: 1, time: 60000 });
		
						// Ajoute la réponse de l'utilisateur à la map 'usersResponse'
						collector.on('collect', response => {
							console.log(user.username + ' a répondu qu\'il commencera à jouer à ' + response.content + ' pour le wipe du ' + wipeDate);
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
				});
		
				// Met à jour le messagePlanif
				function updateMess() {
					let new_content = `------------------------------------------\n**${wipeDate}**`;
		
					if (usersYes.length > 0) {
						usersYes.sort((a, b) => {
							if (usersResponse.get(a) === '?') return 1;
							if (usersResponse.get(b) === '?') return -1;
							return usersResponse.get(a) > usersResponse.get(b) ? 1 : -1;
						});

						new_content += `\n\n✅ ${usersYes.map(user => `${user} - ${usersResponse.get(user) == undefined ? "?" : usersResponse.get(user) }`).join('\n✅ ')}`;
					}
		
					if (usersNotSure.length > 0) {
						new_content += `\n\n❓ ${usersNotSure.join('\n❓ ')}`;
					}
		
					if (usersNo.length > 0) {
						new_content += `\n\n❌ ${usersNo.join('\n❌ ')}`;
					}
		
					messagePlanif.edit({ content: new_content });
				}
			};
			console.log('\nFin de la récupération des messages de planifs de wipes !\n');
		}

		// On récupère le salon "planifs-tournages" et on cherche si des messages de planifs ont déjà été envoyés dans le salon
		let channelPlanifShootingName = 'planifs-tournages';
		const channelPlanifShooting = client.channels.cache.find(channelPlanifShooting => channelPlanifShooting.name === channelPlanifShootingName);
		const messagesPlanifShooting = await channelPlanifShooting.messages.fetch();

		// Si des messages de planifs ont déjà été envoyés, on créé un collecteur pour chaque message pour récupérer les réactions des utilisateurs
		if (messagesPlanifShooting.size > 0) {
			console.log('Des messages de planifs de tournages ont déjà été envoyés dans le salon "planifs-tournages", récupération des messages...');
			for(const messagePlanif of messagesPlanifShooting.values()) {
				// Si le message est vide, on passe au message suivant
				if(messagePlanif.content === undefined) continue;
				
				// Si la première ligne du message est "__**Prochains tournages**__", on passe au message suivant
				if (messagePlanif.content.startsWith('__**Prochains tournages**__')) continue;

				// Listes des utilisateurs qui ont réagi avec les emojis
				let usersYes = [];
				let usersNotSure = [];
				let usersNo = [];

				// On lit le messagePlanif pour récupérer la date de tournage et on supprime les '**'
				const messageContent = messagePlanif.content;
				const messageContentSplit = messageContent.split('\n');
				const shootingDate = messageContentSplit[1].slice(2, messageContentSplit[1].length - 2);
				console.log('\n★ Date de tournage : ' + shootingDate);

				// On récupère les utilisateurs qui ont réagi avec les emojis et on les ajoute dans les listes correspondantes
				for(const reaction of messagePlanif.reactions.cache.values()) {
					const users = await reaction.users.fetch();
					for(const user of users.values()) {
						if (!user.bot) {
							if (reaction.emoji.name === '✅') {
								console.log(user.username + ' a réagi avec l\'emoji ✅');
								usersYes.push(user.username);
							}
							else if (reaction.emoji.name === '❓') {
								console.log(user.username + ' a réagi avec l\'emoji ❓');
								usersNotSure.push(user.username);
							}
							else if (reaction.emoji.name === '❌') {
								console.log(user.username + ' a réagi avec l\'emoji ❌');
								usersNo.push(user.username);
							}
						}
					};
				};

				updateMess();

				const filter = (reaction, user) => {
					return ['✅', '❓', '❌'].includes(reaction.emoji.name) && !user.bot;
				};
		
				const collector = messagePlanif.createReactionCollector(filter);
		
				collector.on('collect', async (reaction, user) => {
					// Récupère toutes les réactions de l'utilisateur
					const userReactions = messagePlanif.reactions.cache.filter(reaction => reaction.users.cache.has(user.id));
		
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
						console.log(user.username + ' a réagi avec l\'emoji ✅ pour le tournage du ' + shootingDate);
						usersYes.push(user.username);
						updateMess();
					} 
					
					// Ajoute le nom de l'utilisateur à la liste de réactions '❓'
					else if (reaction.emoji.name === '❓') {
						console.log(user.username + ' a réagi avec l\'emoji ❓ pour le tournage du ' + shootingDate)
						usersNotSure.push(user.username);
						updateMess();
					} 
					
					// Ajoute le nom de l'utilisateur à la liste de réactions '❌'
					else if (reaction.emoji.name === '❌') {
						console.log(user.username + ' a réagi avec l\'emoji ❌ pour le tournage du ' + shootingDate)
						usersNo.push(user.username);
						updateMess();
					}
				});
		
				// Met à jour le messagePlanif
				function updateMess() {
					let new_content = `------------------------------------------\n**${shootingDate}**`;
		
					if (usersYes.length > 0) {
						new_content += `\n\n✅ ${usersYes.join('\n✅ ')}`;
					}
		
					if (usersNotSure.length > 0) {
						new_content += `\n\n❓ ${usersNotSure.join('\n❓ ')}`;
					}
		
					if (usersNo.length > 0) {
						new_content += `\n\n❌ ${usersNo.join('\n❌ ')}`;
					}
		
					messagePlanif.edit({ content: new_content });
				}
			};
			console.log('\nFin de la récupération des messages de planifs de tournages !\n');
		}
		console.log('\nLe bot est prêt ! Connecté en tant que ' + client.user.tag + ' !\n');
	},
};