define(
  'ephox.alloy.api.behaviour.Highlighting',

  [

  ],

  function () {
    // If readability becomes a problem, stop dynamically generating these.
    var access = function (component) {
      return component.apis();
    };

    // I want to avoid exposing info/detail on component, so let's see how this plays out.
    var getFirst = function (component) {
      return access(component).getFirst();
    };

    var getLast = function (component) {
      return access(component).getLast();
    };

    var highlight = function (component) {
      access(component).highlight();
    };

    return {
      getFirst: getFirst,
      getLast: getLast,
      highlight: highlight
    };
  }
);