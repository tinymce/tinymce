import { Maybes } from '@ephox/katamari';

const closest = (api, node, predicate, isRoot) => Maybes.from(api.predicateFindClosest(node, predicate, isRoot));

export {
  closest
};

