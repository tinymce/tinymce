import { ModelApi, ModelLocation } from './Api';

const descendants = (api: ModelApi, scope: ModelLocation, predicate: (loc: ModelLocation) => boolean): ModelLocation[] =>
  api.predicateFilter.descendants(scope, predicate);

export {
  descendants
};
