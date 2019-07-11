import Jsc from '@ephox/wrap-jsverify';

import { WeightedChoice } from './WeightedChoice';
import { Option } from '@ephox/katamari';

interface Decorator {
  weight: number;
  property: string;
  value: any; // generator
}

const gOne = function (wDecorations: Decorator[]) {
  return WeightedChoice.generator(wDecorations).flatMap(function (choice: Option<Decorator>) {
    return choice.fold(function () {
      return Jsc.constant({}).generator;
    }, function (c) {
      return c.value.map(function (v) {
        const r = {};
        r[c.property] = v;
        return r;
      });
    });
  });
};

const gEnforce = function (decorations) {
  return Jsc.constant(decorations).generator;
};

export default {
  gOne,
  gEnforce
};
