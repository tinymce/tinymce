import { Maybes, Maybe } from '@ephox/katamari';
import { ModelApi, ModelLocation } from './Api';

const closest = (api: ModelApi, loc: ModelLocation, predicate: (loc: ModelLocation) => boolean, isRoot: (loc: ModelLocation) => boolean): Maybe<ModelLocation> =>
  Maybes.from(api.predicateFind.closest(loc, predicate, isRoot));

export {
  closest
};
