# Future features

This file records the planned features for Hermes, in a quick and dirty way.

### Team passwords

Store the passwords for not-created-yet teams.

### Admin configuration per guild

A way to set different configurations for different guilds on the same bot.

### Admin documentation

Document the admin's features.

### Team tracking

Get students that aren't part of any team.

### Admin contact

A way to contact the admins or the bot developer for help using the bot (without being a part of a team).

### Update notifyier

A way for Hermes to notify the admins whenever there's a new version of the software available for download.

## Long term / currently unlikely

Here are the possible features that seem unlikely to ever be implemented due to how the bot is currently being used in production scenarios. Mainly, implementing more QoL features in the bot would require giving it extra accesses and permissions. However, the current philosophy in the real scenarios where the bot is being used is to keep its permissions and accesses to the bare minimum, for security reasons.

### Team roles

**(Requires extra permissions for the bot.)**

Create role per team. Comfortably mention an entire team with that role.

### Student identification

**(Requires the bot to join the server before any student + some extra setup in the server + identifying via bot commands; or the bot to read previous messages.)**

A way to keep track of which student (name and surnames) is which Discord user. Also, automatically giving them some kind of @Student rank.

### Overriding the python client

**(Requires a huge effort and currently it wouldn't provide any clear benefits.)**

Just get rid of the python client and do the things directly from Discord/node.js!
