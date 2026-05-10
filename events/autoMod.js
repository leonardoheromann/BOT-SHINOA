const fs = require('fs');

const LOG_CHANNEL_ID = '1503151222306377758';

/* =========================
   NORMALIZAÇÃO
========================= */

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function deobfuscate(text) {
  return text
    .replace(/0/g, 'o')
    .replace(/1/g, 'i')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/@/g, 'a')
    .replace(/\$/g, 's')
    .replace(/\|/g, 'i');
}

/* =========================
   BASE WORDS (AUTO-MOD)
========================= */

const baseWords = [
  'idiot', 'burro', 'otario', 'lixo', 'merd', 'fdp',
  'arromb', 'imbecil', 'nojent', 'desgra', 'babaca',
  'inutil', 'fraco', 'trouxa', 'retard', 'escroto',
  'verme', 'vagabund', 'corno', 'cu', 'bosta',
  'porra', 'puta', 'caralh', 'pau', 'bucet'
];

/* =========================
   FUNÇÃO TOXICIDADE
========================= */

function isToxic(text) {
  if (!text) return false;

  let t = normalize(deobfuscate(text));
  let score = 0;

  for (const word of baseWords) {
    if (t.includes(word)) score += 2;
  }

  // padrões
  const patterns = [
    /(foda|fds)/i,
    /(p[o0]rr)/i,
    /(c4r4lh|caralh)/i,
    /(vtmnc|vsf)/i
  ];

  for (const p of patterns) {
    if (p.test(text)) score += 3;
  }

  // spam
  if (/(.)\1{4,}/.test(text)) score += 1;

  return score >= 3;
}

/* =========================
   WARN SYSTEM
========================= */

function warnUser(userId) {
  const file = './warnings.json';

  let data = {};
  if (fs.existsSync(file)) {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  }

  if (!data[userId]) data[userId] = [];

  data[userId].push({
    reason: 'AutoMod',
    date: new Date().toLocaleString('pt-BR')
  });

  fs.writeFileSync(file, JSON.stringify(data, null, 2));

  return data[userId].length;
}

/* =========================
   BOT EVENT
========================= */

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    if (!isToxic(message.content)) return;

    const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

    // apagar mensagem
    await message.delete().catch(() => {});

    const warns = warnUser(message.author.id);

    const member = await message.guild.members.fetch(message.author.id).catch(() => null);

    // aviso
    const msg = await message.channel.send(
      `⚠️ ${message.author}, evite esse tipo de mensagem.`
    );
    setTimeout(() => msg.delete().catch(() => {}), 5000);

    // log
    if (logChannel) {
      logChannel.send(
`🚨 AUTO-MOD
👤 ${message.author.tag}
💬 ${message.content}
📊 Warns: ${warns}`
      );
    }

    if (!member) return;

    // mute
    if (warns === 3) {
      await member.timeout(10 * 60 * 1000, 'AutoMod');
    }

    // kick
    if (warns === 4) {
      await member.kick('AutoMod');
    }

    // ban
    if (warns >= 5) {
      await member.ban({ reason: 'AutoMod' });

      const file = './warnings.json';
      let data = {};

      if (fs.existsSync(file)) {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
      }

      data[message.author.id] = [];
      fs.writeFileSync(file, JSON.stringify(data, null, 2));
    }
  });
};
