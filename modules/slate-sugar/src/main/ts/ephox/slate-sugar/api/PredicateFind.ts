import { Maybes, Maybe } from '@ephox/katamari';
import { ModelApi, SlateLoc } from './Api';

const closest = (api: ModelApi, node: SlateLoc, predicate: (node: SlateLoc) => boolean, isRoot: (node: SlateLoc) => boolean): Maybe<SlateLoc> =>
  Maybes.from(api.predicateFindClosest(node, predicate, isRoot));

export {
  closest
};

