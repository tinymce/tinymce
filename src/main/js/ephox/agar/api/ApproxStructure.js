define(
  'ephox.agar.api.ApproxStructure',

  [
    'ephox.agar.assertions.ApproxComparisons',
    'ephox.agar.assertions.ApproxStructures'
  ],

  function (ApproxComparisons, ApproxStructures) {
    var build = function (f) {
      var strApi = {
        is: ApproxComparisons.is,
        startsWith: ApproxComparisons.startsWith,
        none: ApproxComparisons.none
      };

      var arrApi = {
        not: ApproxComparisons.not,
        has: ApproxComparisons.has,
        hasPrefix: ApproxComparisons.hasPrefix
      };

      return f(
        {
          element: ApproxStructures.element,
          text: ApproxStructures.text,
          anything: ApproxStructures.anything
        },
        strApi,
        arrApi
      );
    };

    return {
      build: build
    };
  }
);