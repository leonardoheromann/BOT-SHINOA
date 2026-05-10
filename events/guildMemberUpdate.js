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

      // cargos adicionados
      addedRoles.forEach(role => {
        logChannel.send(
`👑 Cargo ADICIONADO: ${role.name}
👤 ${newMember.user.tag}
📌 ${role.name}`
        );
      });

      // cargos removidos
      removedRoles.forEach(role => {
        logChannel.send(
`❌ Cargo REMOVIDO: ${role.name}
👤 ${newMember.user.tag}
📌 ${role.name}`
        );
      });

    } catch (err) {
      console.log('Erro no guildMemberUpdate:', err);
    }
  });
};
