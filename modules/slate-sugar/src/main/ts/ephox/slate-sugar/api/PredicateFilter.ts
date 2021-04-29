import { Maybes } from '@ephox/katamari';

const descendants = (api, scope, predicate) => Maybes.from(api.predicateFilterDescendants(scope, predicate));

export {
  descendants
};
