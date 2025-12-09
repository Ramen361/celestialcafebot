const { Client, GatewayIntentBits, PermissionsBitField } = require("discord.js");
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent, 
    GatewayIntentBits.GuildMembers
  ] 
});

const token = process.env.DISCORD_TOKEN;
const prefix = process.env.PREFIX || "!";

// 8ball responses
const responses = [
  "Yes.", "No.", "Maybe.", "Definitely.", "Absolutely not!", 
  "I have no idea.", "Ask again later."
];

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ---------------- Commands ----------------
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
- !8ball <question> → magic 8ball answer
- !avatar <@user> → shows user's avatar
- !server → shows server info
- !kick <@user> → kicks a member (requires permission)
- !ban <@user> → bans a member (requires permission)
- !timeout <@user> <seconds> → temporarily mutes member
    `);
  }

  // 8ball
  if (command === "8ball") {
    if (!args.length) return message.reply("Ask a full question!");
    const response = responses[Math.floor(Math.random() * responses.length)];
    message.channel.send(`🎱 ${response}`);
  }

  // Avatar
  if (command === "avatar") {
    const user = message.mentions.users.first() || message.author;
    message.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`);
  }

  // Server info
  if (command === "server") {
    const { guild } = message;
    message.channel.send(`Server name: ${guild.name}\nTotal members: ${guild.memberCount}`);
  }

  // ---------------- Moderation ----------------
  // Kick
  if (command === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply("You don't have permission to kick members!");
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a member to kick!");
    if (!member.kickable) return message.reply("I cannot kick this user!");
    member.kick().then(() => message.channel.send(`${member.user.tag} has been kicked.`));
  }

  // Ban
  if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply("You don't have permission to ban members!");
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a member to ban!");
    if (!member.bannable) return message.reply("I cannot ban this user!");
    member.ban().then(() => message.channel.send(`${member.user.tag} has been banned.`));
  }

  // Timeout
  if (command === "timeout") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply("You don't have permission to timeout members!");
    const member = message.mentions.members.first();
    const duration = parseInt(args[1]);
    if (!member) return message.reply("Mention a member to timeout!");
    if (isNaN(duration)) return message.reply("Provide timeout duration in seconds!");
    member.timeout(duration * 1000).then(() => message.channel.send(`${member.user.tag} has been timed out for ${duration} seconds.`));
  }
});

// Tiny web server for Render
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Celestia Bot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { 
            background: #a8dadc;  /* light blue background */
            color: #1d3557;       /* dark blue text */
            font-family: 'Arial', sans-serif; 
            text-align: center; 
            padding: 50px 20px;   /* add horizontal padding for mobile */
            margin: 0;
          }
          h1 { 
            color: #457b9d;       /* heading color */
            font-size: 6vw;       /* responsive heading size */
            margin-bottom: 20px;
          }
          p { 
            font-size: 4vw;       /* responsive paragraph size */
            margin-bottom: 20px; 
          }
          a { 
            color: #1d3557; 
            text-decoration: none; 
            font-weight: bold;
            font-size: 4vw;
          }
          a:hover { 
            color: #e63946;      /* red on hover */
          }
          img { 
            border-radius: 20px; 
            margin-top: 20px;
            width: 50%;           /* responsive image width */
            max-width: 300px;     /* limit image size on big screens */
            height: auto;
          }
          @media (min-width: 768px) {
            h1 { font-size: 48px; }
            p, a { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>Celestia Bot is Online!</h1>
        <p>Join our Discord server: <a href="https://discord.gg/YOUR_SERVER_LINK">Click Here</a></p>
        <img src="https://cdn.discordapp.com/attachments/1410769852519678053/1448084326389518366/514a37c7899487b062fea779072a3716.jpg?ex=6939f91f&is=6938a79f&hm=9abba8902399090299a523107a61e1d42ebbcb0a02095b0c1171ebf568c7614e&" alt="Celestia Bot"/>
      </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

// Log in
client.login(token);
