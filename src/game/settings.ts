export interface Settings {
  /**
   * How many factories initial systems start with.
   *
   * The more factories the faster a system can churn out units. This number
   * is also used as the maximum number of factories that an imperial system
   * will build.
   */
  readonly initialFactories: 10 | 15 | 20;

  /**
   * How many units of distance a ship moves a turn, maximum.
   *
   * The faster the speed the farther ships can make it every "tick" of the game.
   */
  readonly shipSpeedATurn: 4 | 5 | 6;

  /**
   * Game difficulty, which controls a lot of things.
   *
   * Primarily, this determines how will computer playesr play, the production
   * level, and the severity of privateer attacks.
   */
  readonly gameDifficulty: 'Easy' | 'Hard' | 'Tough';

  /**
   * Maximum amount of turns the game will go until a player wins.
   */
  readonly maxGameLength: number;

  /**
   * How much information players receive about events in the sector.
   *
   * At the lowest level ("Show Nothing"), you only receive events about things
   * you did, and the map will only show your stars and stars you have scouted.
   *
   * Each level above "Show Nothing" tells you a little bit more, with
   * "Everything including *" being intended for beginner players. The
   * recommended default is "Combat and Events".
   */
  readonly displayLevel:
    | 'Show Nothing'
    | 'Combat and Events'
    | 'Combat, Events, and Movements'
    | 'Combat, Events, Moves, and Scouts'
    | 'Everything including Full Map View'
    | 'Everything including Map and Free Intel';

  /**
   * Novice games do not include StealthShips, Missiles, System Defenses,
   * Production Limits, wrecking, or fleet missions. This is intended to let
   * players get comfortable quickly.
   */
  readonly enableNoviceMode: boolean;

  /**
   * Whether to enable or disable the creation of system defenses.
   */
  readonly enableSystemDefenses: boolean;

  /**
   * Whether to enable or disable random events.
   *
   * Events occur sporadically and affect almost every part of the game.
   */
  readonly enableRandomEvents: boolean;

  /**
   * Whether to enable or disable imperial systems producing new units.
   *
   * If true, imperial sysetms will produce ships, defenses, and troops at 1/2
   * the rate of player systems. Turning on this option makes expanding more
   * difficult, since imperial systesm are more heavily defended as the game
   * progresses.
   */
  readonly enableEmpireBuilds: boolean;
}