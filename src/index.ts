import discord, { TextChannel } from 'discord.js';
import config from '../data/config';
import { CommandProcessor } from './processor';

const client = new discord.Client();
client.once('ready', async () => {
  const broadcast = (await client.channels.fetch(
    config.listen[0],
  )) as TextChannel;
  const processor = new CommandProcessor({
    broadcast: (messages: string | discord.MessageEmbed): void => {
      broadcast.send(messages);
    },

    message: (
      player: string,
      messages: string | discord.MessageEmbed,
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
      const isDM = message.channel.type === 'dm';
      let input = message.cleanContent;
      if (!isDM) {
        if (!input.startsWith('!')) {
          return;
        } else {
          input = input.slice(1);
        }
      }
      processor.process(message.author.id, input, isDM);
    }
  });
});

client.login(config.token);
