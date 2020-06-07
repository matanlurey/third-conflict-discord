import discord, { TextChannel } from 'discord.js';
import fs from 'fs-extra';
import path from 'path';
import readLine from 'readline';
import config from '../data/config';
import { startingRatings } from './game/combat/rating';
import { NewlyCreatedGame } from './game/save';
import { Game, GameState } from './game/state/game';
import { Player, PlayerState } from './game/state/player';
import { Session } from './session';
import { DiscordUI } from './ui/discord';

const file = path.join('data', process.argv[2]);
const json: GameState | NewlyCreatedGame = fs.readJsonSync(file);
const reader = readLine.createInterface(process.stdin);
const players: { [key: string]: string } = {};

async function startGame(
  game: Game,
  client: discord.Client,
  broadcast: TextChannel,
): Promise<void> {
  game.onTurnEnded(() => {
    fs.writeJson(path.join('data', 'autosave.json'), game.state, { spaces: 2 });
  });
  const session = new Session(game, new DiscordUI(), {
    message: (user, message): void => {
      client.users.fetch(user).then((u) => u.send(message));
    },
    broadcast: (message): void => {
      // console.log('<BROADCAST>', message);
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
  game.players.forEach((p) => {
    if (!p.isAI) {
      session.summary(p, false, true);
    }
  });
}

async function loadGame(client: discord.Client): Promise<void> {
  // Broadcast channel.
  const broadcast = (await client.channels.fetch(
    config.listen[0],
  )) as TextChannel;

  if ('turn' in json) {
    const userIds = json.players
      .filter((p) => !new Player(p).isAI)
      .map((p) => p.userId);
    broadcast.send(
      `Loaded from \`${file}\`, an existing game with ${userIds
        .map((u) => `<@${u}>`)
        .join(', ')}`,
    );
    const game = new Game(json);
    startGame(game, client, broadcast);
  } else {
    const userIds = Object.keys(players);
    broadcast.send(
      `Created from \`${file}\`, a new game with ${userIds
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
    startGame(game, client, broadcast);
  }
}

function connectToDiscord(): void {
  const client = new discord.Client();
  client.once('ready', () => {
    loadGame(client);
  });
  client.login(config.token);
}

if (!('turn' in json)) {
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
} else {
  connectToDiscord();
}
