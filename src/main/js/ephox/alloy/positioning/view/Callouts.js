define(
  'ephox.repartee.view.Callouts',

  [
    'ephox.alloy.positioning.layout.Origins',
    'ephox.alloy.positioning.view.Anchors',
    'ephox.alloy.positioning.view.Bounder',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Height',
    'ephox.sugar.api.view.Width'
  ],

  function (Origins, Anchors, Bounder, Fun, Option, Classes, Css, Height, Width) {
    /*
     * This is the old repartee API. It is retained in a similar structure to the original form,
     * in case we decide to bring back the flexibility of working with non-standard positioning.
     */

    var elementSize = function (p) {
      return {
        width: Fun.constant(Width.getOuter(p)),
        height: Fun.constant(Height.getOuter(p))
      };
    };

    var layout = function (anchorBox, element, bubbles, options) {
      // clear the potentially limiting factors before measuring
      Css.remove(element, 'max-height');

      var elementBox = elementSize(element);
      return Bounder.attempts(options.preference(), anchorBox, elementBox, bubbles, options.bounds());
    };

    var setClasses = function (element, decision) {
      Classes.remove(element, Anchors.all());
      Classes.add(element, decision.classes());
    };

    /*
     * maxHeightFunction is a MaxHeight instance.
     * max-height is usually the distance between the edge of the popup and the screen; top of popup to bottom of screen for south, bottom of popup to top of screen for north.
     *
     * There are a few cases where we specifically don't want a max-height, which is why it's optional.
     */
    var setHeight = function (element, decision, options) {
      // The old API enforced MaxHeight.anchored() for fixed position. That no longer seems necessary.
      var maxHeightFunction = options.maxHeightFunction();

      maxHeightFunction(element, decision.maxHeight());
    };

    var position = function (element, decision, options) {
      var addPx = function (num) { return num + 'px'; };

      var newPosition = Origins.reposition(options.origin(), decision);
      Css.setOptions(element, {
        position: Option.some(newPosition.position()),
        left: newPosition.left().map(addPx),
        top: newPosition.top().map(addPx),
        right: newPosition.right().map(addPx),
        bottom: newPosition.bottom().map(addPx)
      });
    };

    return {
      layout: layout,
      setClasses: setClasses,
      setHeight: setHeight,
      position: position
    };
  }
);