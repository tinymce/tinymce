import { Maybes, Maybe } from '@ephox/katamari';
import { ModelApi, SlateLoc } from './Api';

const descendants = (api: ModelApi, scope: SlateLoc, predicate: (node: SlateLoc) => boolean): Maybe<SlateLoc[]> =>
  Maybes.from(api.predicateFilterDescendants(scope, predicate));

export {
  descendants
};
