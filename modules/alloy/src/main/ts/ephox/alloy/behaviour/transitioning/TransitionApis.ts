import { Obj, Optional } from '@ephox/katamari';
import { Attribute, Class } from '@ephox/sugar';

import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from '../common/BehaviourState';
import { TransitioningConfig, TransitionProperties } from './TransitioningTypes';

export interface TransitionRoute {
  readonly destination: string;
  readonly start: string;
}

interface TransitionInfo {
  readonly transition: {
    readonly property: string;
    readonly transitionClass: string;
  };
  readonly route: TransitionProperties;
}

// TYPIFY
const findRoute = (component: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, route: TransitionRoute): Optional<TransitionProperties> => {
  return Obj.get(transConfig.routes, route.start).bind((sConfig) => Obj.get(sConfig, route.destination));
};

const getTransition = (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless): Optional<TransitionInfo> => {
  const route = getCurrentRoute(comp, transConfig, transState);
  return route.bind((r) => getTransitionOf(comp, transConfig, transState, r));
};

const getTransitionOf = (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, route: TransitionRoute): Optional<TransitionInfo> =>
  findRoute(comp, transConfig, transState, route).bind((r: TransitionProperties) => r.transition.map((t) => ({
    transition: t,
    route: r
  })));

const disableTransition = (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless): void => {
  // Disable the current transition
  getTransition(comp, transConfig, transState).each((routeTransition) => {
    const t = routeTransition.transition;
    Class.remove(comp.element, t.transitionClass);
    Attribute.remove(comp.element, transConfig.destinationAttr);
  });
};

const getNewRoute = (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, destination: string): TransitionRoute => ({
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  start: Attribute.get(comp.element, transConfig.stateAttr)!,
  destination
});

const getCurrentRoute = (comp: AlloyComponent, transConfig: TransitioningConfig, _transState: Stateless): Optional<TransitionRoute> => {
  const el = comp.element;
  return Attribute.getOpt(el, transConfig.destinationAttr).map((destination) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    start: Attribute.get(comp.element, transConfig.stateAttr)!,
    destination
  }));
};

const jumpTo = (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, destination: string): void => {
  // Remove the previous transition
  disableTransition(comp, transConfig, transState);
  // Only call finish if there was an original state
  if (Attribute.has(comp.element, transConfig.stateAttr) && Attribute.get(comp.element, transConfig.stateAttr) !== destination) {
    transConfig.onFinish(comp, destination);
  }
  Attribute.set(comp.element, transConfig.stateAttr, destination);
};

const fasttrack = (comp: AlloyComponent, transConfig: TransitioningConfig, _transState: Stateless, _destination: string): void => {
  if (Attribute.has(comp.element, transConfig.destinationAttr)) {
    Attribute.getOpt(comp.element, transConfig.destinationAttr).each((destination) => {
      Attribute.set(comp.element, transConfig.stateAttr, destination);
    });
    Attribute.remove(comp.element, transConfig.destinationAttr);
  }
};

const progressTo = (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, destination: string): void => {
  fasttrack(comp, transConfig, transState, destination);
  const route = getNewRoute(comp, transConfig, transState, destination);
  getTransitionOf(comp, transConfig, transState, route).fold(() => {
    jumpTo(comp, transConfig, transState, destination);
  }, (routeTransition) => {
    disableTransition(comp, transConfig, transState);
    const t = routeTransition.transition;
    Class.add(comp.element, t.transitionClass);
    Attribute.set(comp.element, transConfig.destinationAttr, destination);
  });
};

const getState = (comp: AlloyComponent, transConfig: TransitioningConfig, _transState: Stateless): Optional<string> =>
  Attribute.getOpt(comp.element, transConfig.stateAttr);

export {
  findRoute,
  disableTransition,
  getCurrentRoute,
  jumpTo,
  progressTo,
  getState
};
