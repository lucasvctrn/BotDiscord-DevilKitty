const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('day-wipes')
		.setDescription('Liste les wipes qui ont lieu à une journée donnée')
		.addStringOption(option => 
			option.setName('day')
						.setDescription('Journée du wipe (ex: lundi, mardi, ...)')
						.setRequired(true))
		.setDMPermission(false),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /day-wipes');

		// Vérifie que l'utilisateur qui a appelé la commande est bien membre du rôle "⚜️ Team DK ⚜️" ou "🕹️ Teammate 🕹️"
		if (!interaction.member.roles.cache.some(role => role.name === '⚜️ Team DK ⚜️' || role.name === '🕹️ Teammate 🕹️')) 
		{
			// Si l'utilisateur n'est pas membre du rôle "⚜️ Team DK ⚜️", on envoie un message d'erreur
			console.log('\n★ Commande annulée : /day-wipes (l\'utilisateur n\'est pas membre du rôle ⚜️ Team DK ⚜️ ou 🕹️ Teammate 🕹️)');
			return interaction.reply({ content: `Vous n'avez pas la permission d'utiliser cette commande.`, ephemeral: true });
		}

		const wipeDay = interaction.options.getString('day').toLowerCase();
		// Récupération des serveurs qui wipent le jour saisi
		let rawdata = fs.readFileSync('wipes.json');
		let servers = (JSON.parse(rawdata)).servers;
		let dayWipesServers = [];
		for (let server of servers) {
			for(let wipe of server.wipes) {
				if (wipe.day.toLowerCase() === wipeDay) {
					dayWipesServers.push(server);
					break;
				}
			}
		}

		// Si dayWipesServers est vide, on envoie un message d'erreur indiquant que le jour saisie n'existe pas et que le format est incorrect
		if (dayWipesServers.length === 0) return interaction.reply({ content: `Le jour saisi n'existe pas ou le format est incorrect. Veuillez réessayer en saisissant un jour de la semaine en français (ex: lundi, mardi, ...).`, ephemeral: true });

		// Envoie la liste des serveurs qui wipent le jour saisi
		let string = `Voici la liste des serveurs qui wipent ${wipeDay}.`;
		for (let server of dayWipesServers) {
			string += `\n\n**${server.name}**`;
			for(let wipe of server.wipes) {
				if (wipe.day.toLowerCase() === wipeDay) {
					string += `\n★ ${wipe.day} à ${wipe.hour}`;
					string += `\n★ ${wipe.type === "FullWipe" ? "FullWipe" : `${wipe.type} (planning : https://survivors.gg/#wipe)` }`;
				};
			}
			string += `\n★ ${server.group_limit == 0 ? "No Group Limit" : `Group Limit ${server.group_limit}`}`;
			string += `\n★ connect ${server.ip}`;
		}
		await interaction.reply(string);
	}
};
