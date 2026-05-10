const { PermissionsBitField } = require('discord.js');

module.exports = {
  name: 'clear',
  description: 'Apaga mensagens do chat',
  
  async execute(message, args) {
    // permissões
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ Você não tem permissão para apagar mensagens.');
    }

    const amount = parseInt(args[0]);

    if (!amount || amount <= 0 || amount > 100) {
      return message.reply('❌ Use um número entre 1 e 100.');
    }

    try {
      await message.channel.bulkDelete(amount, true);
      message.channel.send(`🧹 ${amount} mensagens apagadas!`)
        .then(msg => setTimeout(() => msg.delete().catch(() => {}), 3000));

    } catch (err) {
      console.log(err);
      message.reply('❌ Não consegui apagar as mensagens.');
    }
  }
};
