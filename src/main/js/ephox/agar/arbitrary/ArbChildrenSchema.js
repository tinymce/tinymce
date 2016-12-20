define(
  'ephox.agar.arbitrary.ArbChildrenSchema',

  [
    'ephox.agar.arbitrary.WeightedChoice',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.katamari.api.Merger',
    'ephox.wrap-jsverify.Jsc'
  ],

  function (WeightedChoice, Arr, Obj, Merger, Jsc) {
    var skipChild = '_';

    var toComponents = function (detail) {
      return Obj.mapToArray(detail.components, function (v, k) {
        // If there is no component, then the choice will be None.
        return k !== skipChild ? Merger.deepMerge(v, { component: k }) : v;
      });
    };

    var none = Jsc.constant([ ]).generator;

    var composite = function (rawDepth, detail, construct) {
      var components = toComponents(detail);
      var depth = rawDepth !== undefined ? rawDepth : detail.recursionDepth;

      var genComponent = function (choice, depth) {
        var newDepth = choice.useDepth === true ? depth - 1 : depth;
        return Jsc.generator.nearray(
          construct(choice.component, newDepth).generator
        );
      };

      var repeat = WeightedChoice.generator(components).flatMap(function (choice) {  
        return choice.fold(function () {
          return Jsc.constant([]).generator;
        }, function (c) {
          return genComponent(c, depth);
        });
      });

      return depth === 0 ? Jsc.constant([]).generator : Jsc.generator.nearray(repeat).map(Arr.flatten);
    };

    var structure = function (rawDepth, detail, construct) {
      var components = toComponents(detail);
      return Jsc.number(0, 1).generator.flatMap(function (random) {
        var children = Arr.foldl(components, function (b, component) {
          // TODO: Allow the order to be mixed up?
          return random <= component.chance ? b.concat([ construct(component.component, rawDepth) ]) : b;
        }, [ ]);

        return Jsc.tuple(children).generator;
      });
    };

    return {
      none: none,
      composite: composite,
      structure: structure
    };
  }
);