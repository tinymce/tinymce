import { Arr, Merger, Obj } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import { WeightedChoice } from './WeightedChoice';

const skipChild = '_';

const toComponents = (detail) =>
  Obj.mapToArray(detail.components, (v, k) =>
    // If there is no component, then the choice will be None.
    k !== skipChild ? Merger.deepMerge(v, { component: k }) : v
  );

const none = Jsc.constant([]).generator;

const composite = (rawDepth, detail, construct) => {
  const components = toComponents(detail);
  const depth = rawDepth !== undefined ? rawDepth : detail.recursionDepth;

  const genComponent = (choice, depth) => {
    const newDepth = choice.useDepth === true ? depth - 1 : depth;
    return Jsc.generator.nearray(
      construct(choice.component, newDepth).generator
    );
  };

  const repeat = WeightedChoice.generator(components).flatMap((choice) =>
    choice.fold(
      () => Jsc.constant([]).generator,
      (c) => genComponent(c, depth)
    )
  );

  return depth === 0 ? Jsc.constant([]).generator : Jsc.generator.nearray(repeat).map(Arr.flatten);
};

const structure = (rawDepth, detail, construct) => {
  const components = toComponents(detail);
  return Jsc.number(0, 1).generator.flatMap((random) => {
    // TODO: Allow the order to be mixed up?
    const children = Arr.foldl(
      components,
      (b, component) =>
        random <= component.chance ?
          b.concat([ construct(component.component, rawDepth) ]) :
          b,
      []
    );
    return Jsc.tuple(children).generator;
  });
};

export {
  none,
  composite,
  structure
};
