import { Arr, Merger, Obj } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import { WeightedChoice } from './WeightedChoice';

const skipChild = '_';

const toComponents = function (detail) {
  return Obj.mapToArray(detail.components, function (v, k) {
    // If there is no component, then the choice will be None.
    return k !== skipChild ? Merger.deepMerge(v, { component: k }) : v;
  });
};

const none = Jsc.constant([ ]).generator;

const composite = function (rawDepth, detail, construct) {
  const components = toComponents(detail);
  const depth = rawDepth !== undefined ? rawDepth : detail.recursionDepth;

  const genComponent = function (choice, depth) {
    const newDepth = choice.useDepth === true ? depth - 1 : depth;
    return Jsc.generator.nearray(
      construct(choice.component, newDepth).generator
    );
  };

  const repeat = WeightedChoice.generator(components).flatMap(function (choice) {
    return choice.fold(function () {
      return Jsc.constant([]).generator;
    }, function (c) {
      return genComponent(c, depth);
    });
  });

  return depth === 0 ? Jsc.constant([]).generator : Jsc.generator.nearray(repeat).map(Arr.flatten);
};

const structure = function (rawDepth, detail, construct) {
  const components = toComponents(detail);
  return Jsc.number(0, 1).generator.flatMap(function (random) {
    const children = Arr.foldl(components, function (b, component) {
      // TODO: Allow the order to be mixed up?
      return random <= component.chance ? b.concat([ construct(component.component, rawDepth) ]) : b;
    }, [ ]);

    return Jsc.tuple(children).generator;
  });
};

export default {
  none: none,
  composite: composite,
  structure: structure
};