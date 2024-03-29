const fs = require("fs");
const { PermissionFlagsBits, ChannelType } = require("discord.js");

const Leaderboard = require("../objects/Leaderboard.js")
const CronTime = require("cron").CronTime;

exports.run = async (bot, msg, args, serverID) => {
	// Server-only command:
	if (msg.channel.type === ChannelType.DM) {
		return msg.author.send("That is a server-only command!");
	}

	// TODO: Role
	// "Admin"-only command:
	if (!msg.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
		return msg.reply("who, me?");
	}

	// Channel-specific command:
	if (msg.channel.name !== process.env.LB_CHANNEL) {
		//msg.delete();
		return msg.author.send(
			`Oh no! :(\nYou used the \`${process.env.PRE}leaderboard\` command in the wrong channel!\n`
			+ `It can only be used in #${process.env.LB_CHANNEL}.`
		);
	}

	// Close leaderboard:
	if (args[0] === "close") {
		let name = args[1];
		if (!fs.existsSync(`./guilds/${serverID}/${name}.json`)) {
			let reply = await msg.reply(`leaderboard ${name} does't exist on the server!`);
			return msg.delete({ timeout: 30000 });
		}

		let lb = Leaderboard.fromJSON(JSON.parse(fs.readFileSync(`./guilds/${serverID}/${name}.json`)));
		lb.close();

		if (`${serverID}/${name}` in global.refreshingLeaderboards) {
			/* Refresh leaderboard in the next second to show the red color in Discord */
			global.refreshingLeaderboards[`${serverID}/${name}`].setTime(
				new CronTime(new Date(Date.now() + 1000)));
			global.refreshingLeaderboards[`${serverID}/${name}`].start();

			/* Stop cron job and delete cron object */
			setTimeout(() => {
					global.refreshingLeaderboards[`${serverID}/${name}`].stop();
					delete global.refreshingLeaderboards[`${serverID}/${name}`];
				}, 1100
			);
		}

		return global.log(msg, serverID,
			`Closed leaderboard ${name}.`
		);
	}

	if (args.length < 3 || !args[0].match(/^https?:\/\//)) {
		return msg.reply(
			"I need at least one URL, one leaderboard name " +
			"and one field name to fetch a leaderboard. :sweat_smile:\n" +
			`\`${process.env.PRE}leaderboard [url] [name] [desiredFields] <description ...>\``
		);
	}

	let url = args[0];
	let name = args[1];
	let targetColumns = args[2].replaceAll("_", " ").replace(/[\-,;\/]/g, ",").split(",");

	// TODO: try-catch;
	// Create new leaderboard:
	let lb = new Leaderboard(url, name, serverID);
	let table = await lb.refresh();
	/* NOT NEEDED IN THIS CASE
	// If the refresh request wasn't processed, return.
	if (!table) return;
	*/

	if (args.length > 3) {
		lb.setDescription(args.splice(3).join(" "));
	}

	let embedList = lb.toEmbeds(targetColumns);

	// Fetch destination channel:
	let channel;
	for (let ch of msg.guild.channels.cache.values()) {
		if (ch.name === process.env.LB_CHANNEL) {
			channel = ch;

			break;
		}
	}

	// Send embeds:
	for (let table of embedList) {
		channel.send(table).then(outMsg => {
			outMsg.react("🔄");	// :arrows_counterclockwise:
		});
	}
	return;
}

exports.requiresServerID = false;
