const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate-code')
		.setDescription('Génère aléatoirement un code à 4 chiffres'),

	async execute(interaction) {
		console.log('\n★ Commande appelée : /generate-code');

		// Vérifie que l'utilisateur qui a appelé la commande est bien membre du rôle "⚜️ Team DK ⚜️" ou "🕹️ Teammate 🕹️"
		if (!interaction.member.roles.cache.some(role => role.name === '⚜️ Team DK ⚜️' || role.name === '🕹️ Teammate 🕹️')) 
		{
			// Si l'utilisateur n'est pas membre du rôle "⚜️ Team DK ⚜️" ou "🕹️ Teammate 🕹️", on envoie un message d'erreur
			console.log('\n★ Commande annulée : /generate-code (l\'utilisateur n\'est pas membre du rôle ⚜️ Team DK ⚜️ ou 🕹️ Teammate 🕹️)');
			return interaction.reply({ content: `Vous n'avez pas la permission d'utiliser cette commande.`, ephemeral: true });
		}

		// Génération du code
    let code = Math.floor(Math.random() * 9000) + 1000;

    // Si un même chiffre apparaît trois ou quatre fois d'affilé dans le code, ou que le code est égal à 10000, on regénère un code
    while (code.toString().match(/(.)\1{2,}/) || code === 10000) {
      code = Math.floor(Math.random() * 9000) + 1000;
    }

		// Envoie le code généré
		let string = `🔢 Voici un code à 4 chiffres : **${code}**`;
		await interaction.reply(string);
	}
};
