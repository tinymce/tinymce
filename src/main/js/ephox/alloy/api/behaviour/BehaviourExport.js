define(
  'ephox.alloy.api.behaviour.BehaviourExport',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'global!Array'
  ],

  function (Objects, Arr, Array) {
    // Add some off behaviour also (alternatives).
    var build = function (behaviourName, apiNames, alternatives) {
      // If readability becomes a problem, stop dynamically generating these.

      var access = function (component) {
        return component.apis();
      };

      return Objects.wrapAll(
        Arr.bind(apiNames, function (apiName) {
          return [
            {
              key: apiName,
              // e.g. Highlighting.highlight(component, item)
              value: function (component/*, args */) {
                var args = Array.prototype.slice.call(arguments, 1);
                return access(component)[apiName].apply(undefined, args);
              }
            },
            {
              key: apiName + '_',
              // e.g. Highlighting.highlight(item)(component)
              value: function (/* */) {
                var args = Array.prototype.slice.call(arguments, 0);
                return function (component) {
                  return access(component)[apiName].apply(undefined, args);
                };
              }
            }
          ];
        })
      );
    };

    return {
      build: build
    };
  }
);