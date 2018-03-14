import { Objects } from '@ephox/boulder';
import { Obj, Option } from '@ephox/katamari';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';

import * as ActiveTransitioning from '../../behaviour/transitioning/ActiveTransitioning';
import * as TransitionApis from '../../behaviour/transitioning/TransitionApis';
import TransitionSchema from '../../behaviour/transitioning/TransitionSchema';
import * as Behaviour from './Behaviour';

export interface TransitioningBehaviour extends Behaviour.AlloyBehaviour {
  config: (TransitioningConfig) => { key: string, value: any };
  findRoute?: <T>(comp: AlloyComponent, route: TransitionApis.TransitionRoute) => Option<T>;
  disableTransition?: (comp: AlloyComponent) => void;
  getCurrentRoute?: any;
  jumpTo?: (comp: AlloyComponent, destination: string) => void;
  progressTo?: (comp: AlloyComponent, destination: string) => void;
  getState?: any;

  createRoutes?: any;
  createBistate?: (first: string, second: string, transitions: TransitionProperties) => { key: string, value: any};
  createTristate?: (first: string, second: string, third: string, transitions: TransitionProperties) => { key: string, value: any};
}

export interface TransitioningConfig {
  destinationAttr: () => string;
  stateAttr: () => string;
  initialState: () => string;
  routes: () => { key: string, value: () => any };
  onTransition: () => (comp: AlloyComponent, route) => void;
  onFinish: () => (comp: AlloyComponent, route) => void;
}
export interface TransitionProperties {
  transition: {
    property: string,
    transitionClass: string
  };
}

export type TransitioningInitialState = 'before' | 'current' | 'after';

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