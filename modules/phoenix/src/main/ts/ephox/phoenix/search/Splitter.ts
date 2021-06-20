import { Universe } from '@ephox/boss';
import { Arr, Optional } from '@ephox/katamari';
import { PositionArray, Strings } from '@ephox/polaris';

import * as Spot from '../api/data/Spot';
import { SpotRange } from '../api/data/Types';

/**
 * Re-generates an item's text nodes, split as defined by the positions array.
 *
 * Returns a PositionArray of the result.
 */
const subdivide = <E, D>(universe: Universe<E, D>, item: E, positions: number[]): SpotRange<E>[] => {
  const text = universe.property().getText(item);
  const pieces = Arr.filter(Strings.splits(text, positions), (section) => {
    return section.length > 0;
  });

  if (pieces.length <= 1) {
    return [ Spot.range(item, 0, text.length) ];
  }
  universe.property().setText(item, pieces[0]);

  const others = PositionArray.generate(pieces.slice(1), (a, start) => {
    const nu = universe.create().text(a);
    const result = Spot.range(nu, start, start + a.length);
    return Optional.some(result);
  }, pieces[0].length);

  const otherElements = Arr.map(others, (a) => {
    return a.element;
  });
  universe.insert().afterAll(item, otherElements);

  return [ Spot.range(item, 0, pieces[0].length) ].concat(others);
};

export {
  subdivide
};
