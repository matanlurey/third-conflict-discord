import discord, { TextChannel } from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import readLine from 'readline';
import config from '../data/config';
import { startingRatings } from './game/combat/rating';
import { Game } from './game/state/game';
import { PlayerState } from './game/state/player';
import { Session } from './session';
import { DiscordUI } from './ui/discord';

const file = path.join('data', process.argv[2]);
const json = fs.readJsonSync(file);
const reader = readLine.createInterface(process.stdin);
const players: { [key: string]: string } = {};

async function startGame(client: discord.Client): Promise<void> {
  // Broadcast channel.
  const broadcast = (await client.channels.fetch(
    config.listen[0],
  )) as TextChannel;
  const userIds = Object.keys(players);
  broadcast.send(
    `Loaded \`${file}\`, a game with ${userIds
      .map((u) => `<@${u}>`)
      .join(', ')}`,
  );

  const inputPlayers: PlayerState[] = [];
  for (const userId in players) {
    const name = players[userId];
    const rating = startingRatings();
    inputPlayers.push({
      fogOfWar: {},
      name,
      userId,
      reports: [],
      ratings: {
        naval: rating[0],
        ground: rating[1],
      },
      endedTurn: false,
    });
  }
  const game = Game.start(json, inputPlayers);
  const session = new Session(game, new DiscordUI(), {
    message: (user, message): void => {
      client.users.fetch(user).then((u) => u.send(message));
    },
    broadcast: (message): void => {
      console.log('<BROADCAST>', message);
      broadcast.send(message);
    },
  });

  const listenTo = new Set(config.listen);
  client.on('message', (message) => {
    if (message.channel.type === 'dm') {
      if (message.author.id === client.user?.id) {
        return;
      } else {
        session.handle(message.author.id, true, message.cleanContent);
      }
    } else if (listenTo.has(message.channel.id)) {
      let content = message.cleanContent;
      if (!content.startsWith('!')) {
        return;
      }
      content = content.substring(1);
      session.handle(message.author.id, false, content);
    }
  });
}

function connectToDiscord(): void {
  const client = new discord.Client();
  client.once('ready', () => {
    startGame(client);
  });
  client.login(config.token);
}

function readPlayer(): void {
  console.log('ID:NAME');
  reader.question('ID:NAME', (answer) => {
    if (answer.trim() === '') {
      return connectToDiscord();
    } else {
      const split = answer.split(':');
      players[split[0]] = split[1];
      readPlayer();
    }
  });
}

console.info(`Loaded`, file);
readPlayer();
