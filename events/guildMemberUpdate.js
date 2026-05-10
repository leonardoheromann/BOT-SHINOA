module.exports = (client) => {
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const logChannel = newMember.guild.channels.cache.get('1503147469066993675');
    if (!logChannel) return;

    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.has(role.id));

    addedRoles.forEach(role => {
      logChannel.send(`🟢 Cargo ADICIONADO\n👤 ${newMember.user.tag}\n🎭 ${role.name}`);
    });

    removedRoles.forEach(role => {
      logChannel.send(`🔴 Cargo REMOVIDO\n👤 ${newMember.user.tag}\n🎭 ${role.name}`);
    });
  });
};
