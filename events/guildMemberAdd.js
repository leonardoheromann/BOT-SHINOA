module.exports = (client) => {
  client.on('guildMemberAdd', member => {
    const role = member.guild.roles.cache.get('1258989363476303923');

    if (!role) return;

    member.roles.add(role)
      .then(() => console.log(`Cargo dado para ${member.user.tag}`))
      .catch(err => console.log('Erro ao dar cargo:', err));
  });
};
