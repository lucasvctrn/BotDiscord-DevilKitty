const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('today-wipes')
		.setDescription('Liste les wipes du jour')
		.setDMPermission(false),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /today-wipes');
		const todayDate = new Date();
		const today = todayDate.toLocaleString('fr-FR', { weekday: 'long' });

		// Récupération des serveurs qui wipent aujourd'hui
		let rawdata = fs.readFileSync('wipes.json');
		let servers = (JSON.parse(rawdata)).servers;
		let todayWipesServers = [];
		for (let server of servers) {
			for(let wipe of server.wipes) {
				if (wipe.day.toLowerCase() === today) {
					todayWipesServers.push(server);
					break;
				}
			}
		}

		// Envoie la liste des serveurs qui wipent aujourd'hui
		let string = `Voici la liste des serveurs qui wipent aujourd'hui.`;
		for (let server of todayWipesServers) {
			string += `\n\n**${server.name}**`;
			for(let wipe of server.wipes) {
				if (wipe.day.toLowerCase() === today) {
					string += `\n★ Wipe aujourd'hui à ${wipe.hour}`;
					string += `\n★ ${wipe.type === "FullWipe" ? "FullWipe" : `${wipe.type}, à vérifier ici : https://survivors.gg/#wipe` }`;
				};
			}
			string += `\n★ ${server.group_limit == 0 ? "No Group Limit" : `Group Limit ${server.group_limit}`}`;
			string += `\n★ connect ${server.ip}`;
			string += `\n★ ${server.battlemetrics}`;
		}
		await interaction.reply(string);
	}
};