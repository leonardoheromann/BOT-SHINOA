const fs = require('fs');

const LOG_CHANNEL_ID = '1503151222306377758';

/* =========================
   🧠 NORMALIZAÇÃO
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
    .replace(/\|/g, 'i')
    .replace(/!/g, 'i');
}

/* =========================
   🔥 BASE WORDS (SÓ RAÍZES)
========================= */

const baseWords = [
  'idiot', 'burro', 'otario', 'lixo', 'merd', 'fdp',
  'arromb', 'imbecil', 'nojent', 'desgra', 'babaca',
  'inutil', 'fraco', 'trouxa', 'retard', 'escroto',
  'verme', 'vagabund', 'corno', 'cu', 'bosta',
  'porra', 'puta', 'caralh', 'pau', 'bucet', 'piranh'
];

/* =========================
   🚨 FUNÇÃO TOXICIDADE
========================= */

function isToxic(text) {
  if (!text || typeof text !== 'string') return false;

  let t = normalize(deobfuscate(text));
  let score = 0;

  // palavras base
  for (const word of baseWords) {
    if (t.includes(word)) score += 2;
  }

  // padrões bypass
  const patterns = [
    /(foda|fds)/i,
    /(p[o0]rr)/i,
    /(c4r4lh|caralh)/i,
    /(vtmnc|vsf)/i,
    /(bct|bucet)/i
  ];

  for (const p of patterns) {
    if (p.test(text)) score += 3;
  }

  // spam de letras repetidas
  if (/(.)\1{4,}/.test(text)) score += 1;

  // espaçamento tipo i d i o t a
  if (/(.{1,2}\s){4,}/.test(text)) score += 2;

  return score >= 3;
}

/* =========================
   ⚠️ WARN SYSTEM SEGURO
========================= */

function warnUser(userId) {
  const file = './warnings.json';

  let data = {};

  try {
    if (fs.existsSync(file)) {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (err) {
    data = {};
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
   🤖 EVENTO PRINCIPAL
========================= */

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    try {
      if (!message || !message.guild) return;
      if (message.author.bot) return;
      if (!message.content) return;

      if (!isToxic(message.content)) return;

      const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

      // 🔥 apagar mensagem
      if (message.deletable) {
        await message.delete().catch(() => {});
      }

      const warns = warnUser(message.author.id);

      const member = await message.guild.members.fetch(message.author.id).catch(() => null);

      // ⚠️ aviso no chat
      const warnMsg = await message.channel.send(
        `⚠️ ${message.author}, evite esse tipo de mensagem!`
      );

      setTimeout(() => {
        warnMsg.delete().catch(() => {});
      }, 5000);

      // 📋 LOG
      if (logChannel) {
        logChannel.send({
          content:
`🚨 AUTO-MOD ATIVO
👤 Usuário: ${message.author.tag}
💬 Mensagem: ${message.content}
📊 Warns: ${warns}`
        });
      }

      if (!member) return;

      // 🔇 MUTE
      if (warns === 3) {
        await member.timeout(10 * 60 * 1000, 'AutoMod');

        if (logChannel) {
          logChannel.send(`🔇 MUTE: ${message.author.tag}`);
        }
      }

      // 👢 KICK
      if (warns === 4) {
        await member.kick('AutoMod');

        if (logChannel) {
          logChannel.send(`👢 KICK: ${message.author.tag}`);
        }
      }

      // ⛔ BAN
      if (warns >= 5) {
        await member.ban({ reason: 'AutoMod' });

        const file = './warnings.json';

        let data = {};
        try {
          if (fs.existsSync(file)) {
            data = JSON.parse(fs.readFileSync(file, 'utf8'));
          }
        } catch (err) {
          data = {};
        }

        data[message.author.id] = [];

        fs.writeFileSync(file, JSON.stringify(data, null, 2));

        if (logChannel) {
          logChannel.send(`⛔ BAN: ${message.author.tag}`);
        }
      }

    } catch (err) {
      console.log('⚠️ AutoMod error:', err);
    }
  });
};
