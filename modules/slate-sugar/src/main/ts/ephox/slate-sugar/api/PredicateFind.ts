import { Maybes } from '@ephox/katamari';

const closest = (api, node, predicate, isRoot) => Maybes.from(api.getOrNull().predicateFindClosest(node, predicate, isRoot));

export {
  closest
};

