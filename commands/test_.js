const fs = require("fs");
const { execSync } = require("child_process");

/**
 * Send a program to the client.
 */	
exports.run = async (bot, msg, args, file) => {
	let student = global.getStudent(msg.author.id);

	let line = ``;
	// Check if the last valid command should be used:
	if (args.length == 1 && (args[0] === "last" || args[0] === "l")) {
		// Check if there's a last command saved:
		if (student.latestClientCommand == null) {
			return msg.reply(
				`**Error**: I don't have any record of any previous command, ` +
				`so I cannot guess where you are trying to send it.`
			);
		}
		line = student.latestClientCommand;

	} else {
		/* DEFAULT ARGUMENTS COMPLETION */

		// Check if user and password were BOTH sent or not sent:
		if ((!args.includes("-u") && args.includes("-x"))
			|| (args.includes("-u") && !args.includes("-x"))) {
			return msg.reply(
				`**Error**: You must specify both an username (-u) ` +
				`and a password (-x) when sending a program to the queue.`
			);
		// Check and use default user and password:
		} else if ((!args.includes("-u"))) {
			if (!student.preferredServer in student.credentials) {
				return msg.reply(
					`**Error**: You must join a team before launching any request.`
				);
			}
			let credentials = student.credentials[student.preferredServer];
			if (credentials.passwd == null || credentials.passwd == "null") {
				return msg.reply(
					`**Error**: You have no password set for ${credentials.team} yet.`
				);
			}
			line = ` -u ${credentials.team} -x ${credentials.passwd} ` + line;
		}

		// Check if no queue was provided and there's no default one.
		if (!args.includes("-q") && student.preferredQueue == null) {
			return msg.reply(
				`**Error**: You must specify a queue to send the program to.`
			);
		// Check and use default queue:
		} else if (!args.includes("-q")) {
			line = ` -q ${student.preferredQueue} ` + line;
		}

		// Reconstruct the client command:
		line += ` ${args.join(" ")}`;
	}

	// Send the program to the corresponding queue:
	try {
		//console.log(`python2 ./tools/client ./programs/${file} ${line}`);
		let output = execSync(`python2 ./tools/client ./programs/${file} ${line}`);
		fs.unlinkSync(`./programs/${file}`);
		student.setCommand(line);
		let outuputContent = output.toString();
		msg.reply(`Sent: \`${line}\`\n` + outuputContent.substring(outuputContent.indexOf("\n")));

		// Fetch request server:
		let server = "";
		for (let id of student.guilds) {
			if (id in student.credentials && line.includes(student.credentials[id].team)
				&& line.includes(student.credentials[id].passwd)) {
				server = id;
				break;
			}
		}

		if (server !== "") {
			global.log(
				msg,
				server,
				`New request:\n` +
				`Sent: \`${line}\`\n` + output.toString()
			);
		}


		/* Create the request as a refreshable embed: */

		// Fetch request url:
		let outputLines = output.toString().split("\n");
		let reqURL = outputLines[outputLines.length - 2];
		if (!reqURL.startsWith("http://")) return; // Return on failed executions.

		msg.channel.startTyping();

		// Create request object:
		const Request = require("../objects/Request.js");
		let req = new Request(reqURL, server);
		let table = await req.refresh();

		// Error fetching request table:
		if (!table) {
			throw new Error(
				"The results associated to the Request couldn't be found. " +
				"Your program probably didn't reach the server, and it wasn't processed. " +
				"Check the link of your Request to verify this.\n" +
				"Please try again. If the problem persists, contact a server administrator."
			);
		}

		// Create and send embed:
		let embed = req.toEmbed();
		let reply;
		if (req.output !== "") {
			reply = await msg.reply(req.output, embed);
		} else {
			reply = await msg.reply(embed);
		}
		reply.react("🔄");

		msg.channel.stopTyping();
	} catch (exc) {
		msg.channel.stopTyping();
		console.error(exc.stack);
		console.error(exc.message);
		//global.log(msg, `\`\`\`\n${exc.stack}\n\`\`\``);
		if (fs.existsSync(`./programs/${file}`)) fs.unlinkSync(`./programs/${file}`);
		msg.reply(
			`**Error while sending the program to the queue.**\n${exc.message}`
		);
	}
}
