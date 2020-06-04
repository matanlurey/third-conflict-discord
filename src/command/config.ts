export class Command {
  private readonly config: Readonly<{
    name: string;
    options: Option[];
    description: string;
  }>;

  constructor(name: string, description: string, options: Option[] = []) {
    this.config = {
      name,
      options,
      description,
    };
  }

  get description(): string | undefined {
    return this.config.description;
  }

  get name(): string {
    return this.config.name;
  }

  get options(): Option[] {
    return Array.from(this.config.options);
  }
}

export class Option {
  private readonly config: Readonly<{
    name: string;
    alias?: string | number;
    description?: string;
    default?: string | number | boolean;
    allowed?: (string | number)[];
  }>;

  constructor(
    name: string,
    alias: string | number,
    config?: {
      description?: string;
      default?: string | number | boolean;
      allowed?: (string | number)[];
    },
  ) {
    this.config = {
      name,
      alias,
      description: config?.description,
      default: config?.default,
      allowed: config?.allowed,
    };
  }

  get alias(): string | number | undefined {
    return this.config.alias;
  }

  get allowed(): (string | number)[] | undefined {
    return this.config.allowed;
  }

  get default(): string | number | boolean | undefined {
    return this.config.default;
  }

  get description(): string | undefined {
    return this.config.description;
  }

  get name(): string {
    return this.config.name;
  }
}
