import { Universe } from '@ephox/boss';
import { Arr } from '@ephox/katamari';
import { WordScope } from '../data/WordScope';
import * as Identify from '../words/Identify';
import { ZoneDetails } from './LanguageZones';

interface ZoneInput<E> {
  readonly lang: string;
  readonly words: WordScope[];
  readonly elements: E[];
}

export interface Zone<E> {
  readonly elements: E[];
  readonly lang: string;
  readonly words: WordScope[];
}

export interface Zones<E> {
  readonly zones: Zone<E>[];
}

const nu = <E> (input: ZoneInput<E>): Zone<E> => ({
  elements: input.elements,
  lang: input.lang,
  words: input.words
});

export const fromWalking = function <E, D> (universe: Universe<E, D>, groups: ZoneDetails<E>[]): Zones<E> {
  const zones = Arr.map(groups, function (group: ZoneDetails<E>) {
    const details = group.details();
    const lang = group.lang();

    const line = Arr.map(details, function (x) {
      return x.text();
    }).join('');

    const elements = Arr.map(details, function (x) {
      return x.item();
    });

    const words = Identify.words(line);

    return nu({
      lang,
      words,
      elements
    });
  });

  return {
    zones
  };
};
