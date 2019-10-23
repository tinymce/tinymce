import Jsc from '@ephox/wrap-jsverify';

import { WeightedChoice } from './WeightedChoice';
import { Option } from '@ephox/katamari';

interface Decorator {
  weight: number;
  property: string;
  value: any; // generator
}

const gOne = (wDecorations: Decorator[]) =>
  WeightedChoice.generator(wDecorations).flatMap((choice: Option<Decorator>) =>
    choice.fold(() =>
        Jsc.constant({}).generator,
      (c) => c.value.map((v) => {
        const r = {};
        r[c.property] = v;
        return r;
      })));

const gEnforce = (decorations) => Jsc.constant(decorations).generator;

export {
  gOne,
  gEnforce
};
