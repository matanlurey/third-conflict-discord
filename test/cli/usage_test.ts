import {
  getUsage,
  lookup as findCommand,
  preGameMenu,
} from '../../src/cli/embed';

test('help {waitingForPlayers: false}', () => {
  expect(preGameMenu({ waitingForPlayers: false })).toMatchInlineSnapshot(`
    Object {
      "author": null,
      "color": 39423,
      "description": "_Third Conflict_ is a multiplayer turn-based space strategy.",
      "fields": Array [
        Object {
          "inline": false,
          "name": "🆕 Create a new game",
          "value": "Type \`game create [options]\` or \`help game create\`.",
        },
        Object {
          "inline": false,
          "name": "💾 Load an existing game",
          "value": "Type \`game load <name>\` or \`help game load\`.",
        },
      ],
      "footer": null,
      "image": null,
      "thumbnail": Object {
        "url": "https://i.imgur.com/WBbbYXV.png",
      },
      "timestamp": null,
      "title": "Main Menu (No Game In Progress)",
      "type": "rich",
      "url": undefined,
    }
  `);
});

test('help {waitingForPlayers: true}', () => {
  expect(preGameMenu({ waitingForPlayers: true })).toMatchInlineSnapshot(`
    Object {
      "author": null,
      "color": 39423,
      "description": "_Third Conflict_ is a multiplayer turn-based space strategy.",
      "fields": Array [
        Object {
          "inline": false,
          "name": "🤝 Join the game",
          "value": "Type \`game join\`.",
        },
        Object {
          "inline": false,
          "name": "🎬 Start the game",
          "value": "Type \`game start\`.",
        },
      ],
      "footer": null,
      "image": null,
      "thumbnail": Object {
        "url": "https://i.imgur.com/WBbbYXV.png",
      },
      "timestamp": null,
      "title": "Main Menu (Waiting For Players)",
      "type": "rich",
      "url": undefined,
    }
  `);
});

test('help game', () => {
  expect(getUsage(findCommand(['game'])[0])).toMatchInlineSnapshot(`
    Object {
      "author": null,
      "color": 39423,
      "description": "\`game\`: Setup, join, load, or save a game.

    **Commands**:",
      "fields": Array [
        Object {
          "inline": false,
          "name": "create [options]",
          "value": "Create a new game lobby.",
        },
        Object {
          "inline": false,
          "name": "load <file>",
          "value": "Loads an existing game.",
        },
        Object {
          "inline": false,
          "name": "save <file>",
          "value": "Saves the current game.",
        },
        Object {
          "inline": false,
          "name": "join <name>",
          "value": "Joins the current game lobby.",
        },
        Object {
          "inline": false,
          "name": "start",
          "value": "Starts the current game lobby.",
        },
        Object {
          "inline": false,
          "name": "quit",
          "value": "Quits the game.",
        },
      ],
      "footer": null,
      "image": null,
      "thumbnail": Object {
        "url": "https://i.imgur.com/WBbbYXV.png",
      },
      "timestamp": null,
      "title": "Help",
      "type": "rich",
      "url": undefined,
    }
  `);
});
