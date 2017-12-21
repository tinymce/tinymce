import { Objects } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import { Option } from '@ephox/katamari';
import { Attr } from '@ephox/sugar';
import { Class } from '@ephox/sugar';

var findRoute = function (component, transConfig, transState, route) {
  return Objects.readOptFrom(transConfig.routes(), route.start()).map(Fun.apply).bind(function (sConfig) {
    return Objects.readOptFrom(sConfig, route.destination()).map(Fun.apply);
  });
};

var getTransition = function (comp, transConfig, transState) {
  var route = getCurrentRoute(comp, transConfig, transState);
  return route.bind(function (r) {
    return getTransitionOf(comp, transConfig, transState, r);
  });
};

var getTransitionOf = function (comp, transConfig, transState, route) {
  return findRoute(comp, transConfig, transState, route).bind(function (r) {
    return r.transition().map(function (t) {
      return {
        transition: Fun.constant(t),
        route: Fun.constant(r)
      };
    });
  });
};

var disableTransition = function (comp, transConfig, transState) {
  // Disable the current transition
  getTransition(comp, transConfig, transState).each(function (routeTransition) {
    var t = routeTransition.transition();
    Class.remove(comp.element(), t.transitionClass());
    Attr.remove(comp.element(), transConfig.destinationAttr());
  });
};

var getNewRoute = function (comp, transConfig, transState, destination) {
  return {
    start: Fun.constant(Attr.get(comp.element(), transConfig.stateAttr())),
    destination: Fun.constant(destination)
  };
};

var getCurrentRoute = function (comp, transConfig, transState) {
  var el = comp.element();
  return Attr.has(el, transConfig.destinationAttr()) ? Option.some({
    start: Fun.constant(Attr.get(comp.element(), transConfig.stateAttr())),
    destination: Fun.constant(Attr.get(comp.element(), transConfig.destinationAttr()))
  }) : Option.none();
};

var jumpTo = function (comp, transConfig, transState, destination) {
  // Remove the previous transition
  disableTransition(comp, transConfig, transState);
  // Only call finish if there was an original state
  if (Attr.has(comp.element(), transConfig.stateAttr()) && Attr.get(comp.element(), transConfig.stateAttr()) !== destination) transConfig.onFinish()(comp, destination);
  Attr.set(comp.element(), transConfig.stateAttr(), destination);
};

var fasttrack = function (comp, transConfig, transState, destination) {
  if (Attr.has(comp.element(), transConfig.destinationAttr())) {
    Attr.set(comp.element(), transConfig.stateAttr(), Attr.get(comp.element(), transConfig.destinationAttr()));
    Attr.remove(comp.element(), transConfig.destinationAttr());
  }
};

var progressTo = function (comp, transConfig, transState, destination) {
  fasttrack(comp, transConfig, transState, destination);
  var route = getNewRoute(comp, transConfig, transState, destination);
  getTransitionOf(comp, transConfig, transState, route).fold(function () {
    jumpTo(comp, transConfig, transState, destination);
  }, function (routeTransition) {
    disableTransition(comp, transConfig, transState);
    var t = routeTransition.transition();
    Class.add(comp.element(), t.transitionClass());
    Attr.set(comp.element(), transConfig.destinationAttr(), destination);
  });
};

var getState = function (comp, transConfig, transState) {
  var e = comp.element();
  return Attr.has(e, transConfig.stateAttr()) ? Option.some(
    Attr.get(e, transConfig.stateAttr())
  ) : Option.none();
};

export default <any> {
  findRoute: findRoute,
  disableTransition: disableTransition,
  getCurrentRoute: getCurrentRoute,
  jumpTo: jumpTo,
  progressTo: progressTo,
  getState: getState
};