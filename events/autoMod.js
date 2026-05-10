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
    .replace(/\|/g, 'i')
    .replace(/!/g, 'i');
}

/* =========================
   BASE WORDS
========================= */

const baseWords = [
  'idiot', 'burro', 'otario', 'lixo', 'merd', 'fdp',
  'arromb', 'imbecil', 'nojent', 'desgra', 'babaca',
  'inutil', 'fraco', 'trouxa', 'retard', 'escroto',
  'verme', 'vagabund', 'corno', 'cu', 'bosta',
  'porra', 'puta', 'caralh', 'pau', 'bucet'
];

/* =========================
   DETECÇÃO
========================= */

function isToxic(text) {
  if (!text) return false;

  const raw = text;
  const clean = normalize(deobfuscate(text));

  let score = 0;

  for (const w of baseWords) {
    if (clean.includes(w)) score += 2;
  }

  const patterns = [
    /(foda|fds)/i,
    /(p[o0]rr)/i,
    /(c4r4lh|caralh)/i,
    /(vtmnc|vsf)/i
  ];

  for (const p of patterns) {
    if (p.test(clean)) score += 3;
  }

  if (/(.)\1{4,}/.test(raw)) score += 1;
  if (/(.{1,2}\s){4,}/.test(raw)) score += 2;

  return score >= 3;
}

/* =========================
   WARN SYSTEM
========================= */

function warnUser(userId) {
  const file = './warnings.json';

  let data = {};

  if (fs.existsSync(file)) {
    try {
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      data = {};
    }
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
   EVENTO
========================= */

module.exports = (client) => {
  client.on('messageCreate', async (message) => {
    try {
      if (!message.guild) return;
      if (message.author.bot) return;

      const logChannel = message.guild.channels.cache.get(LOG_CHANNEL_ID);

      if (!isToxic(message.content)) return;

      /* =========================
         🔥 DELETE CORRIGIDO
      ========================= */

      if (message.deletable) {
        try {
          await message.delete();
          console.log("🧹 mensagem apagada");
        } catch (err) {
          console.log("❌ erro ao apagar:", err.message);
        }
      } else {
        console.log("⚠️ mensagem não deletável (permissão ou hierarquia)");
      }

      const warns = warnUser(message.author.id);

      const member = await message.guild.members.fetch(message.author.id).catch(() => null);

      const warnMsg = await message.channel.send(
        `⚠️ ${message.author}, evite esse tipo de mensagem.`
      );

      setTimeout(() => warnMsg.delete().catch(() => {}), 5000);

      if (logChannel) {
        logChannel.send(
`🚨 AUTO-MOD
👤 ${message.author.tag}
💬 ${message.content}
📊 Warns: ${warns}`
        );
      }

      if (!member) return;

      if (warns === 3) {
        await member.timeout(10 * 60 * 1000, 'AutoMod');
      }

      if (warns === 4) {
        await member.kick('AutoMod');
      }

      if (warns >= 5) {
        await member.ban({ reason: 'AutoMod' });

        const file = './warnings.json';
        let data = {};

        if (fs.existsSync(file)) {
          try {
            data = JSON.parse(fs.readFileSync(file, 'utf8'));
          } catch {
            data = {};
          }
        }

        data[message.author.id] = [];
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
      }

    } catch (err) {
      console.log('AutoMod error:', err);
    }
  });
};
