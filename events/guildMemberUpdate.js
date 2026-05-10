const { EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    try {
      const logChannel = newMember.guild.channels.cache.get('1503147469066993675');
      if (!logChannel) return;

      // 🔥 FORÇA DADOS ATUALIZADOS (CORREÇÃO PRINCIPAL)
      const fetchedOldMember = await newMember.guild.members.fetch(oldMember.id);
      const fetchedNewMember = await newMember.guild.members.fetch(newMember.id);

      const oldRoles = fetchedOldMember.roles.cache;
      const newRoles = fetchedNewMember.roles.cache;

      const addedRoles = newRoles.filter(role => !oldRoles.has(role.id));
      const removedRoles = oldRoles.filter(role => !newRoles.has(role.id));

      // 🔎 AUDIT LOG (quem mexeu no cargo)
      const auditLogs = await newMember.guild.fetchAuditLogs({
        type: AuditLogEvent.MemberRoleUpdate,
        limit: 1
      });

      const entry = auditLogs.entries.first();
      const executor = entry?.executor;

      const adminTag = executor ? executor.tag : 'Desconhecido';
      const time = new Date().toLocaleString('pt-BR');

      // 💚 CARGOS ADICIONADOS
      for (const role of addedRoles.values()) {
        const embed = new EmbedBuilder()
          .setColor(0x00ff00)
          .setTitle('💚 Cargo ADICIONADO')
          .setThumbnail(newMember.user.displayAvatarURL())
          .addFields(
            { name: '👤 Usuário', value: newMember.user.tag },
            { name: '🎭 Cargo', value: role.name },
            { name: '🛠️ Responsável', value: adminTag },
            { name: '📅 Horário', value: time }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }

      // ❌ CARGOS REMOVIDOS
      for (const role of removedRoles.values()) {
        const embed = new EmbedBuilder()
          .setColor(0xff0000)
          .setTitle('❌ Cargo REMOVIDO')
          .setThumbnail(newMember.user.displayAvatarURL())
          .addFields(
            { name: '👤 Usuário', value: newMember.user.tag },
            { name: '🎭 Cargo', value: role.name },
            { name: '🛠️ Responsável', value: adminTag },
            { name: '📅 Horário', value: time }
          )
          .setTimestamp();

        await logChannel.send({ embeds: [embed] });
      }

    } catch (err) {
      console.log('Erro no guildMemberUpdate:', err);
    }
  });
};
