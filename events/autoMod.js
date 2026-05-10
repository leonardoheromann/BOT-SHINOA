const fs = require('fs');

const LOG_CHANNEL_ID = '1503151222306377758';

/* =========================
   🧠 FILTRO INTELIGENTE
========================= */

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

const baseWords = [
  'idiota',
  'burro',
  'otario',
  'lixo',
  'merda',
  'fdp'
];

function isToxic(text) {
  const clean = normalize(text);

  let score = 0;

  for (const word of baseWords) {
    if (clean.includes(word)) score += 2;
  }

  const patterns = [
    /foda?s?se/i,
    /p[o0]rr[a@]/i,
    /caralh[o0]/i
  ];

  for (const p of patterns) {
    if (p.test(text)) score += 3;
  }

  if (/(.)\1{4,}/.test(text)) score += 1;

  return score >= 3;
}

/* =========================
   ⚠️ WARN SYSTEM
========================= */

function warnUser(userId) {
  const data = JSON.parse(fs.readFileSync('./warnings.json', 'utf8'));

  if (!data[userId]) data[userId] = [];

  data[userId].push({
    reason: 'Mensagem tóxica',
    date: new Date().toLocaleString('pt-BR')
  });

  fs.writeFileSync('./warnings.json', JSON.stringify(data, null, 2));

  return data[userId].length;
}

/* =========================
   🚨 AUTO-MOD
========================= */

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

    if (!isToxic(message.content)) return;

    await message.delete().catch(() => {});

    const warns = warnUser(message.author.id);

    const member = await message.guild.members.fetch(message.author.id).catch(() => null);

    message.channel.send(`⚠️ ${message.author}, evite esse tipo de mensagem!`).then(m => {
      setTimeout(() => m.delete(), 5000);
    });

    /* LOG GLOBAL */
    if (logChannel) {
      logChannel.send(
`🚨 **PUNIÇÃO AUTOMÁTICA**
👤 Usuário: ${message.author.tag}
💬 Mensagem: "${message.content}"
📊 Warns: ${warns}`
      );
    }

    if (!member) return;

    // 🔇 MUTE
    if (warns === 3) {
      await member.timeout(10 * 60 * 1000, 'Auto-mod');

      if (logChannel) {
        logChannel.send(`🔇 MUTE: ${message.author.tag}`);
      }
    }

    // 👢 KICK
    if (warns === 4) {
      await member.kick('Auto-mod');

      if (logChannel) {
        logChannel.send(`👢 KICK: ${message.author.tag}`);
      }
    }

    // ⛔ BAN
    if (warns >= 5) {
      await member.ban({ reason: 'Auto-mod' });

      const data = JSON.parse(fs.readFileSync('./warnings.json', 'utf8'));
      data[message.author.id] = [];
      fs.writeFileSync('./warnings.json', JSON.stringify(data, null, 2));

      if (logChannel) {
        logChannel.send(`⛔ BAN: ${message.author.tag}`);
      }
    }
  });
};
