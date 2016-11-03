define(
  'ephox.alloy.api.behaviour.Highlighting',

  [
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'global!Array'
  ],

  function (Objects, Arr, Array) {
    // If readability becomes a problem, stop dynamically generating these.

    var access = function (component) {
      return component.apis();
    };

    // TODO: Get from behaviour
    var apiNames = [
      'highlight',
      'dehighlight',
      'dehighlightAll',
      'highlightFirst',
      'highlightLast',
      'isHighlighted',
      'getHighlighted',
      'getFirst',
      'getLast',
      'getPrevious',
      'getNext'
    ];

    return Objects.wrapAll(
      Arr.bind(apiNames, function (apiName) {
        return [
          {
            key: apiName,
            value: function (component/*, args */) {
              var args = Array.prototype.slice.call(arguments, 1);
              return access(component)[apiName].apply(undefined, args);
            }
          },
          {
            key: apiName + '_',
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
  }
);