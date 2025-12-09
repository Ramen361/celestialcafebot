const { Client, GatewayIntentBits, PermissionsBitField, REST, Routes, SlashCommandBuilder } = require("discord.js");
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
const guildId = process.env.GUILD_ID; // your Discord server ID

// 8ball responses
const responses = ["Yes.","No.","Maybe.","Definitely.","Absolutely not!","I have no idea.","Ask again later."];

// ---------------- PREFIX COMMANDS ----------------
client.on("messageCreate", async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    const sent = await message.channel.send("Pinging...");
    sent.edit(`Pong! 🏓 Latency is ${sent.createdTimestamp - message.createdTimestamp}ms.`);
  }

  if (command === "say") {
    const text = args.join(" ");
    if (!text) return message.reply("You didn't type anything!");
    message.channel.send(text);
  }

  if (command === "help") {
    message.channel.send(`
Commands available:
- !ping → check bot latency
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

  if (command === "8ball") {
    if (!args.length) return message.reply("Ask a full question!");
    const response = responses[Math.floor(Math.random() * responses.length)];
    message.channel.send(`🎱 ${response}`);
  }

  if (command === "avatar") {
    const user = message.mentions.users.first() || message.author;
    message.channel.send(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`);
  }

  if (command === "server") {
    const { guild } = message;
    message.channel.send(`Server name: ${guild.name}\nTotal members: ${guild.memberCount}`);
  }

  if (command === "kick") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) return message.reply("You don't have permission!");
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a member to kick!");
    if (!member.kickable) return message.reply("I cannot kick this user!");
    member.kick().then(() => message.channel.send(`${member.user.tag} has been kicked.`));
  }

  if (command === "ban") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return message.reply("You don't have permission!");
    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention a member to ban!");
    if (!member.bannable) return message.reply("I cannot ban this user!");
    member.ban().then(() => message.channel.send(`${member.user.tag} has been banned.`));
  }

  if (command === "timeout") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return message.reply("You don't have permission!");
    const member = message.mentions.members.first();
    const duration = parseInt(args[1]);
    if (!member) return message.reply("Mention a member to timeout!");
    if (isNaN(duration)) return message.reply("Provide duration in seconds!");
    member.timeout(duration * 1000).then(() => message.channel.send(`${member.user.tag} has been timed out for ${duration} seconds.`));
  }
});

// ---------------- SLASH COMMANDS ----------------
const commands = [
  new SlashCommandBuilder().setName("ping").setDescription("Check bot latency"),
  new SlashCommandBuilder().setName("say").setDescription("Make the bot say something")
    .addStringOption(option => option.setName("text").setDescription("Text to say").setRequired(true)),
  new SlashCommandBuilder().setName("help").setDescription("Show commands"),
  new SlashCommandBuilder().setName("8ball").setDescription("Ask the magic 8ball")
    .addStringOption(option => option.setName("question").setDescription("Your question").setRequired(true)),
  new SlashCommandBuilder().setName("avatar").setDescription("Shows a user's avatar")
    .addUserOption(option => option.setName("user").setDescription("User to show").setRequired(false)),
  new SlashCommandBuilder().setName("server").setDescription("Shows server info"),
  new SlashCommandBuilder().setName("kick").setDescription("Kick a member")
    .addUserOption(option => option.setName("user").setDescription("User to kick").setRequired(true)),
  new SlashCommandBuilder().setName("ban").setDescription("Ban a member")
    .addUserOption(option => option.setName("user").setDescription("User to ban").setRequired(true)),
  new SlashCommandBuilder().setName("timeout").setDescription("Timeout a member")
    .addUserOption(option => option.setName("user").setDescription("User to timeout").setRequired(true))
    .addIntegerOption(option => option.setName("duration").setDescription("Duration in seconds").setRequired(true))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  try {
    console.log("Registering slash commands...");
    await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: commands });
    console.log("Slash commands registered!");
  } catch (err) {
    console.error(err);
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, member } = interaction;

  if (commandName === "ping") {
    await interaction.reply(`Pong! 🏓 Latency is ${Date.now() - interaction.createdTimestamp}ms.`);
  }

  if (commandName === "say") {
    const text = options.getString("text");
    await interaction.reply(text);
  }

  if (commandName === "help") {
    await interaction.reply(`
Available commands:
/ping, /say, /8ball, /avatar, /server, /kick, /ban, /timeout
You can also use prefix commands like !ping, !say, etc.
    `);
  }

  if (commandName === "8ball") {
    const response = responses[Math.floor(Math.random() * responses.length)];
    await interaction.reply(`🎱 ${response}`);
  }

  if (commandName === "avatar") {
    const user = options.getUser("user") || interaction.user;
    await interaction.reply(`${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`);
  }

  if (commandName === "server") {
    const { guild } = interaction;
    await interaction.reply(`Server name: ${guild.name}\nTotal members: ${guild.memberCount}`);
  }

  if (commandName === "kick") {
    if (!member.permissions.has(PermissionsBitField.Flags.KickMembers)) return interaction.reply("You don't have permission!");
    const user = options.getUser("user");
    const memberToKick = guild.members.cache.get(user.id);
    if (!memberToKick.kickable) return interaction.reply("I cannot kick this user!");
    memberToKick.kick().then(() => interaction.reply(`${user.tag} has been kicked.`));
  }

  if (commandName === "ban") {
    if (!member.permissions.has(PermissionsBitField.Flags.BanMembers)) return interaction.reply("You don't have permission!");
    const user = options.getUser("user");
    const memberToBan = guild.members.cache.get(user.id);
    if (!memberToBan.bannable) return interaction.reply("I cannot ban this user!");
    memberToBan.ban().then(() => interaction.reply(`${user.tag} has been banned.`));
  }

  if (commandName === "timeout") {
    if (!member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) return interaction.reply("You don't have permission!");
    const user = options.getUser("user");
    const duration = options.getInteger("duration");
    const memberToTimeout = guild.members.cache.get(user.id);
    memberToTimeout.timeout(duration * 1000).then(() => interaction.reply(`${user.tag} has been timed out for ${duration} seconds.`));
  }
});

// ---------------- Web server for Render ----------------
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
            background: #a8dadc;
            color: #1d3557;
            font-family: 'Arial', sans-serif; 
            text-align: center; 
            padding: 50px 20px;   
            margin: 0;
          }
          h1 { color: #457b9d; font-size: 6vw; margin-bottom: 20px; }
          p { font-size: 4vw; margin-bottom: 20px; }
          a { color: #1d3557; text-decoration: none; font-weight: bold; font-size: 4vw; }
          a:hover { color: #e63946; }
          img { border-radius: 20px; margin-top: 20px; width: 50%; max-width: 300px; height: auto; }
          @media (min-width: 768px) { h1 { font-size: 48px; } p, a { font-size: 20px; } }
        </style>
      </head>
      <body>
        <h1>Celestia Bot is Online!</h1>
        <p>Join our Discord server: <a href="https://discord.gg/yJTE5v9h">Click Here</a></p>
        <img src="https://cdn.discordapp.com/attachments/1410769852519678053/1448084326389518366/514a37c7899487b062fea779072a3716.jpg?ex=6939f91f&is=6938a79f&hm=9abba8902399090299a523107a61e1d42ebbcb0a02095b0c1171ebf568c7614e&" alt="Celestia Bot"/>
      </body>
    </html>
  `);
});

app.listen(PORT, () => console.log(`Web server running on port ${PORT}`));

client.login(token);
