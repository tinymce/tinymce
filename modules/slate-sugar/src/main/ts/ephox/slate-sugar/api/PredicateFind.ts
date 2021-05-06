import { Maybes, Maybe } from '@ephox/katamari';
import { ModelApi, SlateLoc } from './Api';

const closest = (api: ModelApi, loc: SlateLoc, predicate: (loc: SlateLoc) => boolean, isRoot: (loc: SlateLoc) => boolean): Maybe<SlateLoc> =>
  Maybes.from(api.predicateFind.closest(loc, predicate, isRoot));

export {
  closest
};

