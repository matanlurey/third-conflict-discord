# TODO

- [x] Add single-player REPL support.
- [x] Add help.
- [x] Add multi-player Discord support.
- [ ] Add version number to save game files.
- [x] Add seed to save game files.

- [x] Add attack.
- [x] Add build.
- [x] Add end.
- [x] Add move.
- [ ] Add gift.
- [x] Add reports.
- [x] Add scan.
- [x] Add scout.
- [x] Add summary.
- [x] Add invade.
- [x] Add load/unload.
- [x] Add map.

- [x] Transports/troops not sending.
- [x] Don't allow 0-size fleets.
- [x] Not case sensitive via DM.
- [x] Intel reports not showing up (Discord)?
- [x] Make reports non-Inline.
- [x] StealthShips are visible not WarShips.
- [x] Fix morale calculation.
- [x] Allow building planets.
- [x] Return scouts.

- [x] Incoming fleets.
- [x] Redirect fleets/scouts if recalled system was conquered.
- [x] Recall fleet.

- [ ] "Invaded with 19 (lost X)".
- [ ] Merge fleets with same target/source/distance.
- [ ] Expontential backoff "still waiting on <@...>".
- [x] Score summary to broadcast.
- [x] Add `scan A --no-planets` to hide planet information.

- [x] 0 fleets stick around (?).
- [x] Scouts with ETA to <= turn.
- [x] Show `Scouts: 8 (3 Returning)`.
- [x] Scout messages not showing up.
- [x] Random combat ratings at start.
- [x] Change combat ratings after combat.
- [x] Allow building up to 50 Defenses per Planet Controlled.
- [x] > =150 Defenses Overwhelm StealthShips First Strike.
- [ ] Allow defenses a chance to intercept missiles.
- [x] Add auto-save and loading an existing game.
- [x] On end turn, say remaining players.

- [x] DM Summary on Game Start.
- [x] Troops unload does not have output; also give more information!
- [x] Shuffle players on Start.
- [x] Have help build say valid options.
- [x] Self-scan is missing Defenses.
- [x] Epidemic strikes [object Object].
- [x] `troops unload D 50 -p 6` had no response, unloaded all troops!
- [ ] Discontent kills troops.
- [x] Determine and report unrest.
- [x] Discontent builds on non-invaded planets, privateers.
- [x] Add overthrow/revert control.
- [x] Test privateers.

- [x] Start of turn: Score, Morale, Ratings.

- [x] End of turn: Increment.
- [x] End of turn: Movement.
- [x] End of turn: Combat.
- [ ] End of turn: End of Game.
- [x] End of turn: Random Event.
- [x] End of turn: Produce.
- [x] End of turn: Morale Check / Revolts / Unrest.

- [ ] Max troops at 1K per planet.
- [ ] More details to combat report.
- [x] Invert morale of planets when invaded.
- [x] Privateers.
- [x] Scrape random events from game and add them.
- [ ] Move homeworld (50pts).

- [x] Empire randomly attacks.
- [ ] Add auto fleet composition / keep a garrison.
- [ ] Visualize incoming fleets as `!`.

- [ ] Add wreck.
- [ ] Add probe.
- [ ] Add raid.
- [ ] Homeworld specific features (production limits).

- [ ] Add general purpose AI.

## Commands

- `attack <target>`: Sends a fleet to attack.
- `build <source> <unit>`: Sets the build queue.
- `end`: End turn.
- `move <target>`: Sends a friendly fleet.
- `reports`: End of turn reports.
- `scan <target>`: Scans a system.
- `scout <target>`: Scouts a system.
- `summary`: Summary of your systems and fleets.
