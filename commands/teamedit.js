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
		return msg.reply("nope.");
	}

	let server = msg.guild.id;

	let teamFiles = fs.readdirSync(`./teams/${server}/`);
	const teamList = teamFiles.filter(team => RegExp(`^${process.env.TEAM_PRE}\\d+.json$`).test(team)
		&& !team.includes("#"));

	if (args.length < 1) {
		return msg.reply(
			`options: \`move, add, remove, setEditable/unconfirm, confirm, password/passwd/pass/pswd, <teamID>\`.`
		);
	}

	let usr, tm;
	switch (args[0]) {
		case "move":{
			if (args.length < 3) {
				return msg.reply(
					`Invalid number of arguments: ` +
					`\`${process.env.PRE}teamedit move <@user> <newTeam>\``
				);
			} else if (args[1].match(/^<@!?\d+>$/) && RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[2])) {
				usr = args[1].match(/^<@!?(\d+)>$/)[1];
				tm = args[2];
			} else if (args[2].match(/^<@!?\d+>$/) && RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[1])) {
				usr = args[2].match(/^<@!?(\d+)>$/)[1];
				tm = args[1];
			} else {
				return msg.reply(
					`the arguments do not have the correct format: ` +
					`\`${process.env.PRE}teamedit move <@user> <newTeam>\``
				);
			}

			let student = global.getStudent(usr);
			let oldTeam = null;
			if (server in student.credentials) {
				oldTeam = global.getTeam(student.credentials[server].team, server);
				oldTeam.leave(usr);
			}

			let team;
			if (teamList.includes(`${tm}.json`)) {
				team = global.getTeam(tm, server);
			} else {
				team = new Team(tm, server);
			}
			team.join(usr);

			return msg.reply(
				`correctly moved <@${usr}> ` +
					(oldTeam !==  null ? `from ${oldTeam.id} ` : ``) +
				`to ${tm}.`
			);}

		case "add":{
			if (args.length < 3) {
				return msg.reply(
					`Invalid number of arguments: ` +
					`\`${process.env.PRE}teamedit add <@user> <team>\``
				);
			} else if (args[1].match(/^<@!?\d+>$/) && RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[2])) {
				usr = args[1].match(/^<@!?(\d+)>$/)[1];
				tm = args[2];
			} else if (args[2].match(/^<@!?\d+>$/) && RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[1])) {
				usr = args[2].match(/^<@!?(\d+)>$/)[1];
				tm = args[1];
			} else {
				return msg.reply(
					`the arguments do not have the correct format: ` +
					`\`${process.env.PRE}teamedit add <@user> <team>\``
				);
			}

			let team;
			if (teamList.includes(`${tm}.json`)) {
				team = global.getTeam(tm, server);
			} else {
				team = new Team(tm, server);
			}
			team.join(usr);

			return msg.reply(
				`correctly added <@${usr}> to the team ${tm}.`
			);}

		case "remove":{
			if (args.length < 3) {
				return msg.reply(
					`Invalid number of arguments: ` +
					`\`${process.env.PRE}teamedit remove <@user> <team>\``
				);
			} else if (args[1].match(/^<@!?\d+>$/) && RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[2])) {
				usr = args[1].match(/^<@!?(\d+)>$/)[1];
				tm = args[2];
			} else if (args[2].match(/^<@!?\d+>$/) && RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[1])) {
				usr = args[2].match(/^<@!?(\d+)>$/)[1];
				tm = args[1];
			} else {
				return msg.reply(
					`the arguments do not have the correct format: ` +
					`\`${process.env.PRE}teamedit remove <@user> <team>\``
				);
			}

			if (!teamList.includes(`${tm}.json`)) {
				return msg.reply(
					"that team doesn't exist."
				);
			}

			let team = global.getTeam(tm, server);
			if (!team.members.includes(usr)) {
				return msg.reply(
					"that user isn't part of that team already."
				);
			}
			team.leave(usr);

			return msg.reply(
				`correctly removed <@${usr}> from the team ${tm}. ` +
				"(Don't forget to `unconfirm` the team if necessary.)"
			);}

		case "setEditable":
		case "unconfirm":{
			let tm;
			if (!RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[1])) {
				return msg.reply(
					"no valid team ID was provided."
				);
			}

			tm = args[1];

			if (!teamList.includes(`${tm}.json`)) {
				return msg.reply(
					"that team doesn't exist."
				);
			}

			let team = global.getTeam(tm, server);
			team.unconfirm();

			return msg.reply(
				`done. Team ${tm} is now editable.`
			);}

		case "confirm":{
			let tm;
			if (!RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[1])) {
				return msg.reply(
					"no valid team ID was provided."
				);
			}

			tm = args[1];

			if (!teamList.includes(`${tm}.json`)) {
				return msg.reply(
					"that team doesn't exist."
				);
			}

			let team = global.getTeam(tm, server);
			team.confirm();

			return msg.reply(
				`OK. Team ${tm} is no longer editable.`
			);}

		case "password":
		case "passwd":
		case "pswd":
		case "pass":{
			let tm;

			if (args.length < 3) {
				//msg.delete();
				return msg.reply(
					`you have to specify a team and its new password: ` +
					`\`${process.env.PRE}teamedit ${args[0]} <teamID> <newPassword>\`.`
				);
			}

			if (!RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[1])) {
				//msg.delete();
				return msg.reply(
					"no valid team ID was provided."
				);
			}

			tm = args[1];

			if (!teamList.includes(`${tm}.json`)) {
				//msg.delete();
				return msg.reply(
					"that team doesn't exist."
				);
			}

			let team = global.getTeam(tm, server);

			team.setPassword(args[2], bot);

			//msg.delete();
			return msg.reply(
				`The password for ${tm} was updated succesfully.`
			);}

		case "rename":{
			let name = "";
			args.shift();
			if (RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[1])) {
				name = args[0];
				tm = args[1];
			} else if (RegExp(`^${process.env.TEAM_PRE}\\d+$`).test(args[0])) {
				tm = args.shift();
				name = args.join(" ");
			} else {
				return msg.reply(
					`the arguments do not have the correct format: ` +
					`\`${process.env.PRE}teamedit rename <team> <newName>\``
				);
			}

			let team;
			if (!teamList.includes(`${tm}.json`)) {
				return msg.reply(
					`team ${tm} doesn't exist.`
				);
			}
			team = global.getTeam(tm, server);
			
			if (team.changeName(name)) {
				return msg.reply(
					`correctly changed ${tm}'s name to \`${name}\`.`
				);
			} else {
				return msg.reply(
					`that name is invalid: it's already used by another team, or it's a team identifier.`
				);
			}}

		default:
			if (args.length > 1) {
				msg.reply(
					`Detected extra arguments after the team ID. Those will be ignored.\n` +
					`(Reminder of the command's structure; the team ID should go second: \`${process.env.PRE}teamedit [option] <teamID> [args]\`.)`
				);
			}

			tm = args[0];			
			if (!teamList.includes(`${tm}.json`)) {
				return msg.reply(
					`team "${tm}" doesn't exist.`
				);
			}

			let team = global.getTeam(tm, server);

			let members = "";
			for (let member of team.members) {
				members += `<@${member}> `
			}
			return msg.channel.send(
				`Raw dump of team ${tm}:\n` + 
				`\`\`\`\n${JSON.stringify(team, null, 2)}\n\`\`\`\n` +
				`Team members: ${members}`
			);
	}
}

exports.requiresServerID = false;
