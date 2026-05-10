const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// =========================
// 📁 EVENTOS
// =========================
require('./events/guildMemberAdd')(client);
require('./events/guildMemberUpdate')(client);

// 🧠 AUTO-MOD (NOVO)
require('./events/autoMod')(client);

// =========================
// 🤖 BOT ONLINE
// =========================
client.once('ready', () => {
  console.log(`Bot online: ${client.user.tag}`);
});

// =========================
// 💬 COMANDOS BÁSICOS
// =========================
client.on('messageCreate', message => {
  if (message.author.bot) return;

  if (message.content === '!ping') {
    message.reply('Pong! 🏓');
  }
});

// =========================
// 🔑 LOGIN
// =========================
client.login(process.env.TOKEN);
