import { Objects } from '@ephox/boulder';
import { Obj } from '@ephox/katamari';

import * as ActiveTransitioning from '../../behaviour/transitioning/ActiveTransitioning';
import * as TransitionApis from '../../behaviour/transitioning/TransitionApis';
import { TransitioningBehaviour, TransitionPropertiesSpec, TransitioningConfigSpec } from '../../behaviour/transitioning/TransitioningTypes';
import TransitionSchema from '../../behaviour/transitioning/TransitionSchema';
import * as Behaviour from './Behaviour';

const createRoutes = (routes: Record<string, TransitionPropertiesSpec>): TransitioningConfigSpec['routes'] => {
  const r: TransitioningConfigSpec['routes'] = { };
  Obj.each(routes, (v: TransitionPropertiesSpec, k: string) => {
    const waypoints = k.split('<->');
    r[waypoints[0]] = Objects.wrap(waypoints[1], v);
    r[waypoints[1]] = Objects.wrap(waypoints[0], v);
  });
  return r;
};

const createBistate = (first: string, second: string, transitions: TransitionPropertiesSpec): TransitioningConfigSpec['routes'] => {
  return Objects.wrapAll([
    { key: first, value: Objects.wrap(second, transitions) },
    { key: second, value: Objects.wrap(first, transitions) }
  ]);
};

const createTristate = (first: string, second: string, third: string, transitions: TransitionPropertiesSpec): TransitioningConfigSpec['routes'] => {
  return Objects.wrapAll([
    {
      key: first,
      value: Objects.wrapAll([
        { key: second, value: transitions },
        { key: third, value: transitions }
      ])
    },
    {
      key: second,
      value: Objects.wrapAll([
        { key: first, value: transitions },
        { key: third, value: transitions }
      ])
    },
    {
      key: third,
      value: Objects.wrapAll([
        { key: first, value: transitions },
        { key: second, value: transitions }
      ])
    }
  ]);
};

const Transitioning: TransitioningBehaviour = Behaviour.create({
  fields: TransitionSchema,
  name: 'transitioning',
  active: ActiveTransitioning,
  apis: TransitionApis,
  extra: {
    createRoutes,
    createBistate,
    createTristate
  }
});

export {
  Transitioning
};
