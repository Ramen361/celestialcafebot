import os
import random
import discord
from discord.ext import commands
from discord import app_commands
from flask import Flask
import threading

# ---------------- Environment ----------------
TOKEN = os.environ.get("DISCORD_TOKEN")
PREFIX = os.environ.get("PREFIX", "!")
GUILD_ID = int(os.environ.get("GUILD_ID", 0))  # For testing slash commands in one server

# ---------------- Bot Setup ----------------
intents = discord.Intents.default()
intents.messages = True
intents.guilds = True
intents.members = True
intents.message_content = True

bot = commands.Bot(command_prefix=PREFIX, intents=intents)
tree = bot.tree  # for slash commands

# 8ball responses
responses = ["Yes.","No.","Maybe.","Definitely.","Absolutely not!","I have no idea.","Ask again later."]

# ---------------- PREFIX COMMANDS ----------------
@bot.command()
async def ping(ctx):
    latency = round(bot.latency * 1000)
    await ctx.send(f"Pong! 🏓 Latency is {latency}ms.")

@bot.command()
async def say(ctx, *, text: str):
    await ctx.send(text)

@bot.command()
async def help(ctx):
    await ctx.send("""
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
""")

@bot.command()
async def _8ball(ctx, *, question: str):
    response = random.choice(responses)
    await ctx.send(f"🎱 {response}")

@bot.command()
async def avatar(ctx, member: discord.Member = None):
    member = member or ctx.author
    await ctx.send(f"{member.name}'s avatar: {member.display_avatar.url}")

@bot.command()
async def server(ctx):
    guild = ctx.guild
    await ctx.send(f"Server name: {guild.name}\nTotal members: {guild.member_count}")

@bot.command()
@commands.has_permissions(kick_members=True)
async def kick(ctx, member: discord.Member):
    await member.kick()
    await ctx.send(f"{member} has been kicked.")

@bot.command()
@commands.has_permissions(ban_members=True)
async def ban(ctx, member: discord.Member):
    await member.ban()
    await ctx.send(f"{member} has been banned.")

@bot.command()
@commands.has_permissions(moderate_members=True)
async def timeout(ctx, member: discord.Member, seconds: int):
    await member.timeout(duration=discord.Duration(seconds=seconds))
    await ctx.send(f"{member} has been timed out for {seconds} seconds.")

# ---------------- SLASH COMMANDS ----------------
@tree.command(name="ping", description="Check bot latency")
async def ping_slash(interaction: discord.Interaction):
    latency = round(bot.latency * 1000)
    await interaction.response.send_message(f"Pong! 🏓 Latency is {latency}ms.")

@tree.command(name="say", description="Make the bot say something")
@app_commands.describe(text="Text to say")
async def say_slash(interaction: discord.Interaction, text: str):
    await interaction.response.send_message(text)

@tree.command(name="8ball", description="Ask the magic 8ball")
@app_commands.describe(question="Your question")
async def _8ball_slash(interaction: discord.Interaction, question: str):
    response = random.choice(responses)
    await interaction.response.send_message(f"🎱 {response}")

@tree.command(name="avatar", description="Show user's avatar")
@app_commands.describe(user="User to show")
async def avatar_slash(interaction: discord.Interaction, user: discord.Member = None):
    user = user or interaction.user
    await interaction.response.send_message(f"{user.name}'s avatar: {user.display_avatar.url}")

@tree.command(name="server", description="Show server info")
async def server_slash(interaction: discord.Interaction):
    guild = interaction.guild
    await interaction.response.send_message(f"Server name: {guild.name}\nTotal members: {guild.member_count}")

@tree.command(name="kick", description="Kick a member")
@app_commands.describe(user="User to kick")
async def kick_slash(interaction: discord.Interaction, user: discord.Member):
    if not interaction.user.guild_permissions.kick_members:
        await interaction.response.send_message("You don't have permission!", ephemeral=True)
        return
    await user.kick()
    await interaction.response.send_message(f"{user} has been kicked.")

@tree.command(name="ban", description="Ban a member")
@app_commands.describe(user="User to ban")
async def ban_slash(interaction: discord.Interaction, user: discord.Member):
    if not interaction.user.guild_permissions.ban_members:
        await interaction.response.send_message("You don't have permission!", ephemeral=True)
        return
    await user.ban()
    await interaction.response.send_message(f"{user} has been banned.")

@tree.command(name="timeout", description="Timeout a member")
@app_commands.describe(user="User to timeout", duration="Duration in seconds")
async def timeout_slash(interaction: discord.Interaction, user: discord.Member, duration: int):
    if not interaction.user.guild_permissions.moderate_members:
        await interaction.response.send_message("You don't have permission!", ephemeral=True)
        return
    await user.timeout(duration=duration)
    await interaction.response.send_message(f"{user} has been timed out for {duration} seconds.")

# ---------------- Sync slash commands on ready ----------------
@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}!")
    await tree.sync(guild=discord.Object(id=GUILD_ID))
    print("Slash commands synced!")

# ---------------- Flask web server ----------------
app = Flask(__name__)

@app.route("/")
def home():
    return """
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
        <p>Join our Discord server: <a href="https://discord.gg/YOUR_SERVER_LINK">Click Here</a></p>
        <img src="https://cdn.discordapp.com/attachments/1410769852519678053/1448084326389518366/514a37c7899487b062fea779072a3716.jpg" alt="Celestia Bot"/>
      </body>
    </html>
    """

# Start Flask in background
threading.Thread(target=lambda: app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 3000)))).start()

# ---------------- Run bot ----------------
bot.run(TOKEN)

