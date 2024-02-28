const { PermissionFlagsBits, ChannelType } = require("discord.js");

exports.run = async (bot, msg, args) => {
	// Server-only command:
	if (msg.channel.type === ChannelType.DM) {
		return msg.author.send("That is a server-only command!");
	}

	// Return if not used properly.
	if (args.length <= 0) return msg.reply("say what?");

	// TODO: Role
	// "Admin"-only command:
	if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
		return msg.reply("I'm not your worker, duh!");
	}

	let channel = msg.channel;
	if (args[0].match(/^<#\d+>$/)) {
		for (let ch of msg.guild.channels.cache.values()) {
			if (ch.id === args[0].match(/^<#(\d+)>$/)[1]) {
				channel = ch;
				break;
			}
		}
		args.shift();

	}

	// Return if not used properly.
	if (args.length <= 0) return msg.reply("I see you're a person of few words...");

	//msg.delete();
	channel.send(args.join(" "));
}

exports.requiresServerID = false;
