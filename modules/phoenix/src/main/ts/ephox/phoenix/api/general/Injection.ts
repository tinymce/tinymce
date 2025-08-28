import { Universe } from '@ephox/boss';

import * as Injection from '../../injection/Injection';

type AtStartOfApi = <E, D>(universe: Universe<E, D>, element: E, offset: number, injection: E) => void;
const atStartOf: AtStartOfApi = Injection.atStartOf;

export {
  atStartOf
};