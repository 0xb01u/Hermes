const fs = require("fs");
const { PermissionFlagsBits, ChannelType } = require("discord.js");

const Team = require("../objects/Team.js");

exports.run = async (bot, msg, args) => {
	// Server-only command:
	if (msg.channel.type === ChannelType.DM) {
		return msg.author.send("That is a server-only command!");
	}

	// TODO: Role
	// "Admin"-only command:
	if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
		return msg.reply("where should I send that team? And... why?");
	}

	let server = msg.guild.id;

	let teamFiles = fs.readdirSync(`./teams/${server}/`);
	const teamList = teamFiles.filter(team => RegExp(`^${process.env.TEAM_PRE}\\d+.json$`).test(team)
		&& !team.includes("#"));

	if (args.length < 2) {		
		return msg.reply(
			`usage: \`${process.env.PRE}teamsend <team> <message ...>.\``
		);
	}

	let tm = args.shift();
	if (!teamList.includes(`${tm}.json`)) {
		return msg.reply(
			`there is no team "${tm}" on the server.`
		);
	}

	let team = global.getTeam(tm, server);
	let teamMsg = args.join(" ");
	let userSent = "";

	for (let member of team.members) {
		bot.users.fetch(member).then(user => {
			user.send(`<@${member}> ${teamMsg}`);
		});
		userSent += `<@${member}> `;

	}

	msg.reply(
		`correctly sent your message to: ${userSent}`
	);	
}

exports.requiresServerID = false;
