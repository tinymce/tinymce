import { Arr, Fun, Merger, Obj } from '@ephox/katamari';
import * as fc from 'fast-check';

import * as WeightedChoice from './WeightedChoice';

type WeightedItem = WeightedChoice.WeightedItem;

interface ChanceItem {
  readonly chance: number;
}

interface Detail<T> {
  readonly components: Record<string, T>;
}

export interface CompositeDetail extends Detail<WeightedItem> {
  readonly recursionDepth?: number;
}

export interface StructureDetail extends Detail<ChanceItem> {}

type Component<T> = T & {
  readonly component?: string;
};

export type Construct<T> = (component: string, depth: number) => fc.Arbitrary<T>;

const skipChild = '_';

const toComponents = <T>(detail: Detail<T>): Component<T>[] =>
  Obj.mapToArray(detail.components, (v, k) =>
    // If there is no component, then the choice will be None.
    k !== skipChild ? Merger.deepMerge(v, { component: k }) : v
  );

const none = fc.constant([]);

const composite = <T>(rawDepth: number | undefined, detail: CompositeDetail, construct: Construct<T>): fc.Arbitrary<T[]> => {
  const components = toComponents(detail);
  const depth = rawDepth ?? detail.recursionDepth;
  if (depth === 0) {
    return none;
  } else {
    const genComponent = (choice: Component<WeightedItem>, depth: number | undefined) => {
      const newDepth = choice.useDepth === true ? depth - 1 : depth;
      return fc.array(construct(choice.component, newDepth), { minLength: 1, maxLength: 5 });
    };

    const repeat = WeightedChoice.generator(components).chain((choice) =>
      choice.fold(
        Fun.constant(none),
        (c) => genComponent(c, depth)
      )
    );

    return fc.array(repeat, { minLength: 1, maxLength: 5 }).map(Arr.flatten);
  }
};

const structure = <T>(rawDepth: number | undefined, detail: StructureDetail, construct: Construct<T>): fc.Arbitrary<T[]> => {
  const components = toComponents(detail);
  return fc.float({ min: 0, max: 1 }).chain((random) => {
    // TODO: Allow the order to be mixed up?
    const children = Arr.foldl<Component<ChanceItem>, fc.Arbitrary<T>[]>(
      components,
      (b, component) =>
        random <= component.chance ?
          b.concat([ construct(component.component, rawDepth) ]) :
          b,
      []
    );
    return fc.tuple(...children);
  });
};

export {
  none,
  composite,
  structure
};
