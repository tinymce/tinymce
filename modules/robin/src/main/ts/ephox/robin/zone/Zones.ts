import { Universe } from '@ephox/boss';
import { Arr, Fun, Struct } from '@ephox/katamari';
import { WordScope } from '../data/WordScope';
import Identify from '../words/Identify';
import { ZoneDetails } from './LanguageZones';

interface ZoneInput<E> {
  lang: string;
  words: WordScope[];
  elements: E[];
}

export interface Zone<E> {
  elements: () => E[];
  lang: () => string;
  words: () => WordScope[];
}

export interface Zones<E> {
  zones: () => Zone<E>[];
}

const nu: <E> (input: ZoneInput<E>) => Zone<E> = Struct.immutableBag([ 'elements', 'lang', 'words' ], [ ]);

const fromWalking = function <E, D> (universe: Universe<E, D>, groups: ZoneDetails<E>[]): Zones<E> {
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
    zones: Fun.constant(zones)
  };
};

export const Zones = {
  fromWalking
};