import { Universe } from '@ephox/boss';

import * as Navigation from '../../wrap/Navigation';
import { SpotPoint } from '../data/Types';

type ToLeafApi = <E, D>(universe: Universe<E, D>, element: E, offset: number) => SpotPoint<E>;
const toLeaf: ToLeafApi = Navigation.toLeaf;

type FreefallLtrApi = <E, D>(universe: Universe<E, D>, element: E) => SpotPoint<E>;
const freefallLtr: FreefallLtrApi = Navigation.freefallLtr;

type FreefallRtlApi = <E, D>(universe: Universe<E, D>, element: E) => SpotPoint<E>;
const freefallRtl: FreefallRtlApi = Navigation.freefallRtl;

export {
  toLeaf,
  freefallLtr,
  freefallRtl
};