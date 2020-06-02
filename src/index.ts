import discord, { TextChannel } from 'discord.js';
import config from '../data/config';
import { CommandProcessor } from './processor';

const client = new discord.Client();
client.once('ready', async () => {
  const broadcast = (await client.channels.fetch(
    config.listen[0],
  )) as TextChannel;
  const processor = new CommandProcessor({
    broadcast: (
      messages: (string | discord.MessageEmbed) | discord.MessageEmbed[],
    ): void => {
      broadcast.send(messages);
    },

    message: (
      player: string,
      messages: (string | discord.MessageEmbed) | discord.MessageEmbed[],
    ): void => {
      client.users
        .fetch(player)
        .then((user) => user.send(messages))
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
    } else if (message.author.id !== client.user?.id) {
      processor.process(
        message.author.id,
        message.cleanContent,
        message.channel.type === 'dm',
      );
    }
  });
});

client.login(config.token);
