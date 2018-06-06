import { Objects } from '@ephox/boulder';
import { Fun, Option } from '@ephox/katamari';
import { Attr, Class } from '@ephox/sugar';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { Stateless } from 'ephox/alloy/behaviour/common/NoState';
import { TransitioningConfig } from 'ephox/alloy/behaviour/transitioning/TransitioningTypes';

export interface TransitionRoute {
  destination: () => string;
  start: () => string;
}

const findRoute = function <T>(component: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, route: TransitionRoute): Option<any> {
  return Objects.readOptFrom(transConfig.routes(), route.start()).map(Fun.apply).bind(function (sConfig) {
    return Objects.readOptFrom(sConfig, route.destination()).map(Fun.apply);
  });
};

const getTransition = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless) {
  const route = getCurrentRoute(comp, transConfig, transState);
  return route.bind(function (r) {
    return getTransitionOf(comp, transConfig, transState, r);
  });
};

const getTransitionOf = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, route: TransitionRoute): Option<any> {
  return findRoute(comp, transConfig, transState, route).bind(function (r) {
    return r.transition().map(function (t) {
      return {
        transition: Fun.constant(t),
        route: Fun.constant(r)
      };
    });
  });
};

const disableTransition = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless) {
  // Disable the current transition
  getTransition(comp, transConfig, transState).each(function (routeTransition: any) {
    const t = routeTransition.transition();
    Class.remove(comp.element(), t.transitionClass());
    Attr.remove(comp.element(), transConfig.destinationAttr());
  });
};

const getNewRoute = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, destination: string) {
  return {
    start: Fun.constant(Attr.get(comp.element(), transConfig.stateAttr())),
    destination: Fun.constant(destination)
  };
};

const getCurrentRoute = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless) {
  const el = comp.element();
  return Attr.has(el, transConfig.destinationAttr()) ? Option.some({
    start: Fun.constant(Attr.get(comp.element(), transConfig.stateAttr())),
    destination: Fun.constant(Attr.get(comp.element(), transConfig.destinationAttr()))
  }) : Option.none();
};

const jumpTo = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, destination: string) {
  // Remove the previous transition
  disableTransition(comp, transConfig, transState);
  // Only call finish if there was an original state
  if (Attr.has(comp.element(), transConfig.stateAttr()) && Attr.get(comp.element(), transConfig.stateAttr()) !== destination) { transConfig.onFinish()(comp, destination); }
  Attr.set(comp.element(), transConfig.stateAttr(), destination);
};

const fasttrack = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, destination: string) {
  if (Attr.has(comp.element(), transConfig.destinationAttr())) {
    Attr.set(comp.element(), transConfig.stateAttr(), Attr.get(comp.element(), transConfig.destinationAttr()));
    Attr.remove(comp.element(), transConfig.destinationAttr());
  }
};

const progressTo = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless, destination: string) {
  fasttrack(comp, transConfig, transState, destination);
  const route = getNewRoute(comp, transConfig, transState, destination);
  getTransitionOf(comp, transConfig, transState, route).fold(function () {
    jumpTo(comp, transConfig, transState, destination);
  }, function (routeTransition) {
    disableTransition(comp, transConfig, transState);
    const t = routeTransition.transition();
    Class.add(comp.element(), t.transitionClass());
    Attr.set(comp.element(), transConfig.destinationAttr(), destination);
  });
};

const getState = function (comp: AlloyComponent, transConfig: TransitioningConfig, transState: Stateless) {
  const e = comp.element();
  return Attr.has(e, transConfig.stateAttr()) ? Option.some(
    Attr.get(e, transConfig.stateAttr())
  ) : Option.none();
};

export {
  findRoute,
  disableTransition,
  getCurrentRoute,
  jumpTo,
  progressTo,
  getState
};