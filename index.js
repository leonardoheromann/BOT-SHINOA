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
// 🔥 AJUSTE DE ESTABILIDADE
// =========================
client.setMaxListeners(20);

// =========================
// 📁 EVENTOS
// =========================
require('./events/guildMemberAdd')(client);
require('./events/guildMemberUpdate')(client);
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
// ⚠️ PROTEÇÃO GLOBAL DE ERROS
// =========================
process.on('unhandledRejection', error => {
  console.log('⚠️ Erro ignorado:', error);
});

process.on('uncaughtException', error => {
  console.log('⚠️ Erro crítico:', error);
});

// =========================
// 🔑 LOGIN
// =========================
client.login(process.env.TOKEN);
