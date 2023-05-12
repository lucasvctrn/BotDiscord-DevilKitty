const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('today-wipes')
		.setDescription('Liste les wipes du jour')
		.setDMPermission(false)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /today-wipes');

		// Vérifie que l'utilisateur qui a appelé la commande est bien membre du rôle "⚜️ Team DK ⚜️"
		if (!interaction.member.roles.cache.some(role => role.name === '⚜️ Team DK ⚜️')) 
		{
			// Si l'utilisateur n'est pas membre du rôle "⚜️ Team DK ⚜️", on envoie un message d'erreur
			console.log('\n★ Commande annulée : /today-wipes (l\'utilisateur n\'est pas membre du rôle ⚜️ Team DK ⚜️)');
			return interaction.reply({ content: `Vous n'avez pas la permission d'utiliser cette commande.`, ephemeral: true });
		}

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
					string += `\n★ ${wipe.type === "FullWipe" ? "FullWipe" : `${wipe.type} (planning : https://survivors.gg/#wipe)` }`;
				};
			}
			string += `\n★ ${server.group_limit == 0 ? "No Group Limit" : `Group Limit ${server.group_limit}`}`;
			string += `\n★ connect ${server.ip}`;
			string += `\n★ ${server.battlemetrics}`;
		}
		await interaction.reply(string);
	}
};
