exports.run = async (bot, msg, args) => {
	if (msg.channel.type !== "dm") {
		let reply = await msg.reply("this command can only be used via DM. Message me directly!");
		//reply.delete({ timeout: 10000 });
		//msg.delete({ timeout: 10000 });
	}

	let student = global.getStudent(msg.author.id);

	if (args.length != 2) {
		return msg.reply(
			`Usage: \`${process.env.PRE}alias <serverAlias> <newAlias>\`\n` +
			`The server's name, replacing all spaces with underscores (\`_\`), ` +
			`is a default \`<serverAlias>\`.`
		);
	}

	if (!(args[0] in student.aliases) && !(args[1] in student.aliases)) {
		return msg.reply(
			`Neither ${args[0]} nor ${args[1]} are currently a server alias. ` +
			`One of them must be a current server alias, and the other a new alias ` +
			`for the same server.\n` +
			`Send \`${process.env.PRE}alias\` for help.`
		);
	}

	let newAlias = alias[0] in student.aliases ? alias[1] : alias[0];
	let oldAlias = alias[0] in student.aliases ? alias[0] : alias[1];
	student.addAlias(oldAlias, newAlias);

	return msg.channel.send(
		`Added ${newAlias} as another alias for ${oldAlias}.`
	);
}