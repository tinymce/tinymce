import { Optional } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import { WeightedChoice } from './WeightedChoice';

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

interface Decorator {
  weight: number;
  property: string;
  value: any; // generator
}

const gOne = (wDecorations: Decorator[]) =>
  WeightedChoice.generator(wDecorations).flatMap((choice: Optional<Decorator>) =>
    choice.fold(() =>
      Jsc.constant({}).generator,
    (c) => c.value.map((v) => {
      const r = {};
      r[c.property] = v;
      return r;
    })));

const gEnforce = (decorations: Decorator[]) => Jsc.constant(decorations).generator;

export {
  gOne,
  gEnforce
};
