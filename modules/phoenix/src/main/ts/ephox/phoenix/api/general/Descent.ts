import type { Universe } from '@ephox/boss';

import * as Navigation from '../../wrap/Navigation';
import type { SpotPoint } from '../data/Types';

type FreefallLtrApi = <E, D>(universe: Universe<E, D>, element: E) => SpotPoint<E>;

type FreefallRtlApi = <E, D>(universe: Universe<E, D>, element: E) => SpotPoint<E>;

type ToLeafApi = <E, D>(universe: Universe<E, D>, element: E, offset: number) => SpotPoint<E>;
const toLeaf: ToLeafApi = Navigation.toLeaf;

const freefallLtr: FreefallLtrApi = Navigation.freefallLtr;

const freefallRtl: FreefallRtlApi = Navigation.freefallRtl;

export {
  toLeaf,
  freefallLtr,
  freefallRtl
};