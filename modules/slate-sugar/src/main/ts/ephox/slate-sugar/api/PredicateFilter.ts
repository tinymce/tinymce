import { ModelApi, SlateLoc } from './Api';

const descendants = (api: ModelApi, scope: SlateLoc, predicate: (loc: SlateLoc) => boolean): SlateLoc[] =>
  api.predicateFilter.descendants(scope, predicate);

export {
  descendants
};
