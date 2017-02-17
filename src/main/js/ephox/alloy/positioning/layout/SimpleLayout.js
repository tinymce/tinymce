define(
  'ephox.alloy.positioning.layout.SimpleLayout',

  [
    'ephox.alloy.positioning.layout.Boxes',
    'ephox.alloy.positioning.layout.Layout',
    'ephox.alloy.positioning.layout.MaxHeight',
    'ephox.alloy.positioning.layout.Origins',
    'ephox.alloy.positioning.view.Callouts',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct'
  ],

  function (Boxes, Layout, MaxHeight, Origins, Callouts, Option, Struct) {
    var reparteeOptions = Struct.immutableBag(['bounds', 'origin', 'preference', 'maxHeightFunction'], []);
    var defaultOr = function (options, key, dephault) {
      return options[key] === undefined ? dephault : options[key];
    };

    // This takes care of everything when you are positioning UI that can go anywhere on the screen (position: fixed)
    var fixed = function (anchor, element, bubble, layouts, overrideOptions) {
      // the only supported override at the moment. Once relative has been deleted, maybe this can be optional in the bag
      var maxHeightFunction = defaultOr(overrideOptions, 'maxHeightFunction', MaxHeight.anchored());

      var anchorBox = anchor.anchorBox();
      var origin = anchor.origin();

      var options = reparteeOptions({
        bounds: Origins.viewport(origin, Option.none()),
        origin: origin,
        preference: layouts,
        maxHeightFunction: maxHeightFunction
      });

      go(anchorBox, element, bubble, options);
    };

    // only one place still needs this, and we'd like to get rid of it.
    var relative = function (anchorBox, element, bubble, _options) {
      var defaults = function (_opts) {
        var opts = _opts !== undefined ? _opts : {};
        return reparteeOptions({
          bounds: defaultOr(opts, 'bounds', Boxes.view()),
          origin: defaultOr(opts, 'origin', Origins.none()),
          preference: defaultOr(opts, 'preference', Layout.all()),
          maxHeightFunction: defaultOr(opts, 'maxHeightFunction', MaxHeight.anchored())
        });
      };

      var options = defaults(_options);
      go(anchorBox, element, bubble, options);
    };

    // This is the old public API. If we ever need full customisability again, this is how to expose it
    var go = function (anchorBox, element, bubble, options) {
      var decision = Callouts.layout(anchorBox, element, bubble, options);

      Callouts.position(element, decision, options);
      Callouts.setClasses(element, decision);
      Callouts.setHeight(element, decision, options);
    };

    return {
      fixed: fixed,
      relative: relative
    };
  }
);