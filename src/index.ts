import discord from 'discord.js';
import config from '../data/config';

const client = new discord.Client();
client.once('ready', () => {
  client.on('message', (message) => {
    if (config.listen.indexOf(message.channel.id) === -1) {
      return;
    }
    console.log(message);
  });
});

client.login(config.token);
