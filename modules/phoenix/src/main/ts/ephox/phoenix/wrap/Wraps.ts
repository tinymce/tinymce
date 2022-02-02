import { Universe } from '@ephox/boss';

import { Wrapter } from '../api/data/Types';

export const Wraps = <E, D>(universe: Universe<E, D>, item: E): Wrapter<E> => {
  const wrap = (contents: E) => {
    universe.insert().append(item, contents);
  };

  return {
    element: item,
    wrap
  };
};
