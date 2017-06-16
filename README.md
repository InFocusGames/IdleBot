# Welcome to IdleBot
IdleBot is a customizable incremental game played using a discord bot.

# Installation
Installation is super easy thanks to npm

1. Install Node.js as well as npm. https://nodejs.org/en/
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
