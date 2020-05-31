import discord from 'discord.js';
import config from '../data/config';
import { GameState } from './game/state';

const client = new discord.Client();
client.once('ready', async () => {
  // Load a game
  const game = await GameState.load(process.argv[2], {
    message: (message, player) => {
      console.log(player?.name, message);
    },
  });
  if (!game) {
    console.error('No game found.');
    process.exit(1);
  }
  console.info('Game loaded!', game.turn);
  client.on('message', (message) => {
    if (config.listen.indexOf(message.channel.id) === -1) {
      return;
    }
    console.log(message);
  });
});

client.login(config.token);
