import { Command } from '../../src/command/config';
import { getRichUsage, getSimpleUsage } from '../../src/command/usage';
import commands from '../../src/commands';

const allCommands = commands({
  enableNoviceMode: false,
  enableSystemDefenses: true,
});

test('getSimpleUsage() of Commands', () => {
  expect('\n' + getSimpleUsage(allCommands)).toMatchInlineSnapshot(`
    "
    attack <target> [options]
    Send an offensive fleet to an enemy system.

    build <source> <unit>
    Changes the production queue for a system.

    end
    Ends your turn.

    reports
    View the previous of turn report.

    scan <target>
    Show intelligence about aother system.

    scout <target> [options]
    Send a scout to another system.

    summary
    Shows a summary of your game.
    "
  `);
});

describe('getSimpleUsage() of command: ', () => {
  const keyed: { [key: string]: Command } = {};
  allCommands.forEach((c) => {
    keyed[c.name] = c;
  });

  test('attack', () => {
    expect('\n' + getSimpleUsage(keyed['attack'])).toMatchInlineSnapshot(`
      "
      attack <target> [options]
      Send an offensive fleet to an enemy system.

      --missiles, -m       Missiles to send.                           
      --points, -p         Build points to send. 50 fit in a Transport.
      --source, -o         Source system.                              
      --stealthships, -s   StealthShips to send.                       
      --transports, -r     Transports to send.                         
      --troops, -t         Troops to send. 50 fit in a Transport.      
      --warships, -w       WarShips to send.                           "
    `);
  });

  test('build', () => {
    expect('\n' + getSimpleUsage(keyed['build'])).toMatchInlineSnapshot(`
      "
      build <source> <unit>
      Changes the production queue for a system.
      "
    `);
  });

  test('end', () => {
    expect('\n' + getSimpleUsage(keyed['end'])).toMatchInlineSnapshot(`
      "
      end
      Ends your turn.
      "
    `);
  });

  test('reports', () => {
    expect('\n' + getSimpleUsage(keyed['reports'])).toMatchInlineSnapshot(`
      "
      reports
      View the previous of turn report.
      "
    `);
  });

  test('scan', () => {
    expect('\n' + getSimpleUsage(keyed['scan'])).toMatchInlineSnapshot(`
      "
      scan <target>
      Show intelligence about aother system.
      "
    `);
  });

  test('scout', () => {
    expect('\n' + getSimpleUsage(keyed['scout'])).toMatchInlineSnapshot(`
      "
      scout <target> [options]
      Send a scout to another system.

      --source, -o         Source system. Defaults to the closest system you control."
    `);
  });

  test('summary', () => {
    expect('\n' + getSimpleUsage(keyed['summary'])).toMatchInlineSnapshot(`
      "
      summary
      Shows a summary of your game.
      "
    `);
  });
});

test('getRichUsage() of Commands', () => {
  expect('\n' + JSON.stringify(getRichUsage(allCommands), undefined, 2))
    .toMatchInlineSnapshot(`
    "
    {
      \\"title\\": \\"Usage\\",
      \\"type\\": \\"rich\\",
      \\"timestamp\\": null,
      \\"fields\\": [
        {
          \\"name\\": \\"attack <target> [options]\\",
          \\"value\\": \\"Send an offensive fleet to an enemy system.\\",
          \\"inline\\": false
        },
        {
          \\"name\\": \\"build <source> <unit>\\",
          \\"value\\": \\"Changes the production queue for a system.\\",
          \\"inline\\": false
        },
        {
          \\"name\\": \\"end\\",
          \\"value\\": \\"Ends your turn.\\",
          \\"inline\\": false
        },
        {
          \\"name\\": \\"reports\\",
          \\"value\\": \\"View the previous of turn report.\\",
          \\"inline\\": false
        },
        {
          \\"name\\": \\"scan <target>\\",
          \\"value\\": \\"Show intelligence about aother system.\\",
          \\"inline\\": false
        },
        {
          \\"name\\": \\"scout <target> [options]\\",
          \\"value\\": \\"Send a scout to another system.\\",
          \\"inline\\": false
        },
        {
          \\"name\\": \\"summary\\",
          \\"value\\": \\"Shows a summary of your game.\\",
          \\"inline\\": false
        }
      ],
      \\"thumbnail\\": null,
      \\"image\\": null,
      \\"author\\": null,
      \\"footer\\": null
    }"
  `);
});

describe('getRichUsage() of command: ', () => {
  const keyed: { [key: string]: Command } = {};
  allCommands.forEach((c) => {
    keyed[c.name] = c;
  });

  test('attack', () => {
    expect('\n' + JSON.stringify(getRichUsage(keyed['attack']), undefined, 2))
      .toMatchInlineSnapshot(`
      "
      {
        \\"title\\": \\"Usage\\",
        \\"type\\": \\"rich\\",
        \\"description\\": \\"attack <target> [options]\\\\nSend an offensive fleet to an enemy system.\\\\n\\",
        \\"timestamp\\": null,
        \\"fields\\": [
          {
            \\"name\\": \\"--missiles, -m\\",
            \\"value\\": \\"Missiles to send.\\",
            \\"inline\\": false
          },
          {
            \\"name\\": \\"--points, -p\\",
            \\"value\\": \\"Build points to send. 50 fit in a Transport.\\",
            \\"inline\\": false
          },
          {
            \\"name\\": \\"--source, -o\\",
            \\"value\\": \\"Source system. Defaults to the closest system you control.\\",
            \\"inline\\": false
          },
          {
            \\"name\\": \\"--source, -o\\",
            \\"value\\": \\"Source system.\\",
            \\"inline\\": false
          },
          {
            \\"name\\": \\"--stealthships, -s\\",
            \\"value\\": \\"StealthShips to send.\\",
            \\"inline\\": false
          },
          {
            \\"name\\": \\"--transports, -r\\",
            \\"value\\": \\"Transports to send.\\",
            \\"inline\\": false
          },
          {
            \\"name\\": \\"--troops, -t\\",
            \\"value\\": \\"Troops to send. 50 fit in a Transport.\\",
            \\"inline\\": false
          },
          {
            \\"name\\": \\"--warships, -w\\",
            \\"value\\": \\"WarShips to send.\\",
            \\"inline\\": false
          }
        ],
        \\"thumbnail\\": null,
        \\"image\\": null,
        \\"author\\": null,
        \\"footer\\": null
      }"
    `);
  });

  test('build', () => {
    expect('\n' + JSON.stringify(getRichUsage(keyed['build']), undefined, 2))
      .toMatchInlineSnapshot(`
      "
      {
        \\"title\\": \\"Usage\\",
        \\"type\\": \\"rich\\",
        \\"description\\": \\"build <source> <unit>\\\\nChanges the production queue for a system.\\\\n\\",
        \\"timestamp\\": null,
        \\"fields\\": [],
        \\"thumbnail\\": null,
        \\"image\\": null,
        \\"author\\": null,
        \\"footer\\": null
      }"
    `);
  });

  test('end', () => {
    expect('\n' + JSON.stringify(getRichUsage(keyed['end']), undefined, 2))
      .toMatchInlineSnapshot(`
      "
      {
        \\"title\\": \\"Usage\\",
        \\"type\\": \\"rich\\",
        \\"description\\": \\"end\\\\nEnds your turn.\\\\n\\",
        \\"timestamp\\": null,
        \\"fields\\": [],
        \\"thumbnail\\": null,
        \\"image\\": null,
        \\"author\\": null,
        \\"footer\\": null
      }"
    `);
  });

  test('reports', () => {
    expect('\n' + JSON.stringify(getRichUsage(keyed['reports']), undefined, 2))
      .toMatchInlineSnapshot(`
      "
      {
        \\"title\\": \\"Usage\\",
        \\"type\\": \\"rich\\",
        \\"description\\": \\"reports\\\\nView the previous of turn report.\\\\n\\",
        \\"timestamp\\": null,
        \\"fields\\": [],
        \\"thumbnail\\": null,
        \\"image\\": null,
        \\"author\\": null,
        \\"footer\\": null
      }"
    `);
  });

  test('scan', () => {
    expect('\n' + JSON.stringify(getRichUsage(keyed['scan']), undefined, 2))
      .toMatchInlineSnapshot(`
      "
      {
        \\"title\\": \\"Usage\\",
        \\"type\\": \\"rich\\",
        \\"description\\": \\"scan <target>\\\\nShow intelligence about aother system.\\\\n\\",
        \\"timestamp\\": null,
        \\"fields\\": [],
        \\"thumbnail\\": null,
        \\"image\\": null,
        \\"author\\": null,
        \\"footer\\": null
      }"
    `);
  });

  test('scout', () => {
    expect('\n' + JSON.stringify(getRichUsage(keyed['scout']), undefined, 2))
      .toMatchInlineSnapshot(`
      "
      {
        \\"title\\": \\"Usage\\",
        \\"type\\": \\"rich\\",
        \\"description\\": \\"scout <target> [options]\\\\nSend a scout to another system.\\\\n\\",
        \\"timestamp\\": null,
        \\"fields\\": [
          {
            \\"name\\": \\"--source, -o\\",
            \\"value\\": \\"Source system. Defaults to the closest system you control.\\",
            \\"inline\\": false
          }
        ],
        \\"thumbnail\\": null,
        \\"image\\": null,
        \\"author\\": null,
        \\"footer\\": null
      }"
    `);
  });

  test('summary', () => {
    expect('\n' + JSON.stringify(getRichUsage(keyed['summary']), undefined, 2))
      .toMatchInlineSnapshot(`
      "
      {
        \\"title\\": \\"Usage\\",
        \\"type\\": \\"rich\\",
        \\"description\\": \\"summary\\\\nShows a summary of your game.\\\\n\\",
        \\"timestamp\\": null,
        \\"fields\\": [],
        \\"thumbnail\\": null,
        \\"image\\": null,
        \\"author\\": null,
        \\"footer\\": null
      }"
    `);
  });
});