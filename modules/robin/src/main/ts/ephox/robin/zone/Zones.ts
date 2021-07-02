import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';

import { WordScope } from '../data/WordScope';
import * as Identify from '../words/Identify';
import { ZoneDetails } from './LanguageZones';

export interface Zone<E> {
  readonly elements: E[];
  readonly lang: string;
  readonly words: WordScope[];
}

export interface Zones<E> {
  readonly zones: Zone<E>[];
}

export const fromWalking = <E, D>(universe: Universe<E, D>, groups: ZoneDetails<E>[]): Zones<E> => {
  const zones = Arr.map(groups, (group: ZoneDetails<E>) => {
    const details = group.details;
    const lang = group.lang;

    const line = Arr.map(details, (x) => x.text).join('');

    const elements = Arr.map(details, (x) => x.item);

    const words = Identify.words(line);

    return {
      lang,
      words,
      elements
    };
  });

  return {
    zones
  };
};
