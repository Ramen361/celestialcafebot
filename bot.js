const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const token = process.env.DISCORD_TOKEN;
const prefix = process.env.PREFIX || "!";

// When bot is ready
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Message listener for commands
client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    message.channel.send("Pong!");
  }

  if (command === "say") {
    const text = args.join(" ");
    if (!text) return message.reply("You didn't type anything!");
    message.channel.send(text);
  }

  if (command === "help") {
    message.channel.send(`
Commands available:
- !ping → check if bot is alive
- !say <text> → make the bot say something
- !help → shows this message
    `);
  }
});

// Tiny web server to keep Render happy
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is online!"));
app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// Log in
client.login(token);
