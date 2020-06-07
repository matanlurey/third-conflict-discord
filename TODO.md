# TODO

- [x] Add single-player REPL support.
- [ ] Add help.
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

- [x] Random combat ratings at start.
- [x] Change combat ratings after combat.
- [x] Allow building up to 50 Defenses per Planet Controlled.
- [x] > =150 Defenses Overwhelm StealthShips First Strike.
- [ ] Allow defenses a chance to intercept missiles.
- [x] Add auto-save and loading an existing game.
- [x] On end turn, say remaining players.

- [x] DM Summary on Game Start.
- [ ] Troops unload does not have output; also give more information!
- [x] Shuffle players on Start.
- [x] Have help build say valid options.
- [x] Self-scan is missing Defenses.
- [x] Epidemic strikes [object Object].
- [x] `troops unload D 50 -p 6` had no response, unloaded all troops!
- [ ] Discontent kills troops.
- [x] Determine and report unrest.
- [x] Discontent builds on non-invaded planets, privateers.
- [x] Add overthrow/revert control.
- [ ] Test privateers.

- [x] Start of turn: Score, Morale, Ratings.

- [x] End of turn: Increment.
- [x] End of turn: Movement.
- [x] End of turn: Combat.
- [ ] End of turn: End of Game.
- [x] End of turn: Random Event.
- [x] End of turn: Produce.
- [ ] End of turn: Morale Check / Revolts / Unrest.

- [ ] More details to combat report.
- [x] Invert morale of planets when invaded.
- [ ] Privateers.
- [x] Scrape random events from game and add them.
- [ ] Move homeworld (50pts).

- [ ] Empire randomly attacks.
- [ ] Add auto fleet composition / keep a garrison.
- [ ] Visualize incoming fleets as `!`.

- [ ] Add wreck.
- [ ] Add probe.
- [ ] Add raid.
- [ ] Homeworld specific features (production limits).

- [ ] Add AI.

## Commands

- `attack <target>`: Sends a fleet to attack.
- `build <source> <unit>`: Sets the build queue.
- `end`: End turn.
- `move <target>`: Sends a friendly fleet.
- `reports`: End of turn reports.
- `scan <target>`: Scans a system.
- `scout <target>`: Scouts a system.
- `summary`: Summary of your systems and fleets.
