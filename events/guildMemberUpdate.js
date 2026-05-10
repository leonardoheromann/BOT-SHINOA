const { EmbedBuilder } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      const logChannel = newMember.guild.channels.cache.get('1503147469066993675');
      if (!logChannel) return;

      const addedRoles = newMember.roles.cache.filter(
        role => !oldMember.roles.cache.has(role.id)
      );

      const removedRoles = oldMember.roles.cache.filter(
        role => !newMember.roles.cache.has(role.id)
      );

      // 🔎 audit log (quem fez a ação)
      const auditLogs = await newMember.guild.fetchAuditLogs({
        type: 25 // MEMBER_ROLE_UPDATE
      });

      const entry = auditLogs.entries.first();
      const executor = entry ? entry.executor : null;

      const adminTag = executor ? executor.tag : 'Desconhecido';
      const time = new Date().toLocaleString('pt-BR');

      // 💚 CARGO ADICIONADO
      addedRoles.forEach(role => {
        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('💚 Cargo ADICIONADO')
          .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: '👤 Usuário', value: `${newMember.user.tag}`, inline: false },
            { name: '🎭 Cargo', value: `${role.name}`, inline: false },
            { name: '🛠️ Admin', value: adminTag, inline: false },
            { name: '📋 Horário', value: time, inline: false }
          )
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      });

      // ❌ CARGO REMOVIDO
      removedRoles.forEach(role => {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Cargo REMOVIDO')
          .setThumbnail(newMember.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: '👤 Usuário', value: `${newMember.user.tag}`, inline: false },
            { name: '🎭 Cargo', value: `${role.name}`, inline: false },
            { name: '🛠️ Admin', value: adminTag, inline: false },
            { name: '📋 Horário', value: time, inline: false }
          )
          .setTimestamp();

        logChannel.send({ embeds: [embed] });
      });

    } catch (err) {
      console.log('Erro no guildMemberUpdate:', err);
    }
  });
};
