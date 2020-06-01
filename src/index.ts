import discord, { TextChannel } from 'discord.js';
import config from '../data/config';
import { CommandProcessor } from './processor';

const client = new discord.Client();
client.once('ready', async () => {
  const broadcast = (await client.channels.fetch(
    config.listen[0],
  )) as TextChannel;
  const processor = new CommandProcessor({
    broadcast: (message: string | discord.MessageEmbed): void => {
      broadcast.send(message);
    },

    message: (player: string, message: string | discord.MessageEmbed): void => {
      client.users
        .fetch(player)
        .then((user) => user.send(message))
        .catch((error) => {
          console.error('Could not send message', player, error);
        });
    },
  });
  client.on('message', (message) => {
    if (
      message.channel.type !== 'dm' &&
      config.listen.indexOf(message.channel.id) === -1
    ) {
      return;
    } else {
      processor.process(message.author.id, message.cleanContent);
    }
  });
});

client.login(config.token);
