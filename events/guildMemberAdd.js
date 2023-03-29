const { Events } = require('discord.js');

module.exports = {
	name: Events.GuildMemberAdd,
	async execute(member) {
		const role = member.guild.roles.cache.find(role => role.name === 'Communauté');
		member.roles.add(role);
	},
};