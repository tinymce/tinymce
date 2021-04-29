import { Maybes } from '@ephox/katamari';

const descendants = (api, scope, predicate) => Maybes.from(api.getOrNull().predicateFilterDescendants(scope, predicate));

export {
  descendants
};
