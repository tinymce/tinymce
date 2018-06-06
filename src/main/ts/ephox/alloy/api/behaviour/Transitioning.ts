import { Objects } from '@ephox/boulder';
import { Obj, Option, Result } from '@ephox/katamari';
import { AlloyComponent } from '../../api/component/ComponentApi';

import * as ActiveTransitioning from '../../behaviour/transitioning/ActiveTransitioning';
import * as TransitionApis from '../../behaviour/transitioning/TransitionApis';
import TransitionSchema from '../../behaviour/transitioning/TransitionSchema';
import * as Behaviour from './Behaviour';
import { TransitioningBehaviour } from 'ephox/alloy/behaviour/transitioning/TransitioningTypes';

const createRoutes = function (routes) {
  const r = { };
  Obj.each(routes, function (v, k) {
    const waypoints = k.split('<->');
    r[waypoints[0]] = Objects.wrap(waypoints[1], v);
    r[waypoints[1]] = Objects.wrap(waypoints[0], v);
  });
  return r;
};

const createBistate = function (first, second, transitions) {
  return Objects.wrapAll([
    { key: first, value: Objects.wrap(second, transitions) },
    { key: second, value: Objects.wrap(first, transitions) }
  ]);
};

const createTristate = function (first, second, third, transitions) {
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

const Transitioning = Behaviour.create({
  fields: TransitionSchema,
  name: 'transitioning',
  active: ActiveTransitioning,
  apis: TransitionApis,
  extra: {
    createRoutes,
    createBistate,
    createTristate
  }
}) as TransitioningBehaviour;

export {
  Transitioning
};