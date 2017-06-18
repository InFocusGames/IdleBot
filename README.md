# Welcome to IdleBot
IdleBot is a customizable incremental game played using a discord bot.

# Installation
Installation is super easy thanks to npm

1. Install Node.js as well as npm. https://nodejs.org/en/ (Requires node 8, not the LTS)
2. Clone or download this repo
3. Navigate to the root directory of this repo
4. Execute `npm install`

# Configuration
Now that you have it installed, navigate to the config directory and rename `example.config.ini` to just `config.ini`

Open that file in ~~vim~~ your favorite text editor and adjust the values to your liking. Make sure you add your secret token into the token line. (Ill potentially implement user and pass later)

Once you have finished configuring, save the file and run `node app` from the root dir to launch the bot!

# Installing themes
Installing themes is super easy, and creating them is as well.

To install,
1. Create your theme using the template file bread.thm, or download one from someone else
2. Place that file in the themes folder
3. Restart the bot.

Thats all you have to do! To change your theme simpy execute `!theme set <theme name>`


# Roadmap
Where will we go from here?
As of now I have various features planned for implementation. The following list is in no particular order, and most likely will not include every feature.

* Autocleaning commands and responses (Deleting old stuff to clean the text channel)
* Shop improvments, buy multiple items with single command
* Better error handling
* Logging
* Leaderboard and potentially other competetive features
* Multi server support
* Active boost. Apply a multiplier for users who are actively interacting.
* Easier theme sharing. Adding via atttchments or downloading.
* Fix bugs for eternity

If there are any feature suggestions, feel free to open an issue, or send me a bitmessage!

BM-2cXXVtM4XrTM8xD6LBvHt1hW2foVBwiprF
