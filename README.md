# Cerberus - Underworld's gatekeeper

Discord bot simulating [UVa's Parallel Computing's Tablón](http://frontendv.infor.uva.es/), a remote-execution system for C programs.

This bot aims to:
 - demonstrate the subject's leaderboard and Discord server could be unified.
 - help some students who lack the necessary hardware to test their CUDA programs.
 - save quota on Tablón.
 - build a large and sufficient shared pool of tests.
 - make time comparisons between different students' programs possible (without launching to Tablón).

## How does it work?

Once the bot joins a Discord server, it uses a specific channel as request queue. All the .c files sent to this channel will be downloaded, compiled and test against a predefinded set of executions. The bot will reply with important information about the output, such as failed executions, failed tests and execution times.

Tests can be added and removed to the pool using commands.

### Legal stuff

This software doesn't support plagiarism in any form.

As a way of avoiding plagiarism, the bot will instantly delete any message sent to the request channel after downloading any .c file attached to it. The downloaded file will also be deleted as soon as it is compiled.

Individual users are responsible for their usage of this bot and any of its functionalities.
