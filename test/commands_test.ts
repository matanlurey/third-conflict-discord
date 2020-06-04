import { Command } from '../src/command/config';
import { getSimpleUsage } from '../src/command/usage';
import commands from '../src/commands';

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
