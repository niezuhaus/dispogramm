import { getSearchableKeys } from '../common/decorators/Searchable';
import { Optionable, OptionType } from '../common/interfaces';
import { Client } from './Client';
import { Geolocation } from './Geolocation';
import { Job } from './Job';
import { Messenger } from './Messenger';
import { Zone } from './Zone';

export class Option {
  readonly item: Optionable;
  readonly value: string;
  readonly type: OptionType;
  readonly cssClass: string;
  readonly searchStrings: string[] = [];

  constructor(item: Optionable, type: OptionType, value: string, cssClass?: string) {
    this.item = item;
    this.value = value;
    this.type = type;
    this.cssClass = cssClass;

    const keys = getSearchableKeys(item);
    this.searchStrings = keys.map((key) => (item[key] ?? '').toString());
  }

  editDistance(value: string): number {
    if (this.searchStrings.map((str) => str.toLowerCase().includes(value)).includes(true)) {
      return 0;
    } else {
      return Math.min(...this.searchStrings.map((str) => str.slice(0, value.length).editDistance(value)));
    }
  }

  get loc(): Geolocation {
    if (this.item instanceof Geolocation) {
      return this.item as Geolocation;
    }
    return null;
  }

  get messenger(): Messenger {
    if (this.type == OptionType.messenger) {
      return this.item as Messenger;
    }
    return null;
  }

  get client(): Client {
    if (this.item instanceof Client) {
      return this.item as Client;
    }
    return null;
  }

  get job(): Job {
    if (this.item instanceof Job) {
      return this.item as Job;
    }
    return null;
  }

  get zone(): Zone {
    if (this.item instanceof Zone) {
      return this.item as Zone;
    }
    return null;
  }
}
