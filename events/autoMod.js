module.exports = (client) => {
  client.on('messageCreate', (message) => {
    if (message.author.bot) return;

    console.log("AutoMod ativo:", message.content);
  });
};
