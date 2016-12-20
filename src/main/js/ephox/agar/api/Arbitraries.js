define(
  'ephox.agar.api.Arbitraries',

  [
    'ephox.agar.api.Generators',
    'ephox.agar.arbitrary.ArbContent',
    'ephox.katamari.api.Fun',
    'ephox.wrap-jsverify.Jsc'
  ],

  function (Generators, ArbContent, Fun, Jsc) {
    var scenario = function (component, overrides, exclusions) {
      // Note, in some environments, scenarios will not work, if setting
      // the arbitrary html involves some normalisation.
      var arbitrary = content(component, overrides);
      var generator = arbitrary.generator.flatMap(function (root) {
        return Generators.selection(root, exclusions).map(function (selection) {
          return {
            root: Fun.constant(root),
            selection: Fun.constant(selection)
          };
        });
      });

      return Jsc.bless({
        generator: generator
      });
    };

    var content = function (component, overrides) {
      return ArbContent.arbOf(component, overrides);
    };

    return {
      scenario: scenario,
      content: content
    };
  }
);