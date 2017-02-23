define(
  'ephox.alloy.positioning.layout.MaxHeight',

  [
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Height',
    'global!Math'
  ],

  function (Fun, Css, Height, Math) {
    // applies the max-height as determined by Bounder
    var setMaxHeight = function (element, maxHeight) {
      Height.setMax(element, Math.floor(maxHeight));
    };


    // adds both max-height and overflow to constrain it
    var anchored = function (element, available) {
      setMaxHeight(element, available);
      Css.setAll(element, {
        'overflow-x': 'hidden',
        'overflow-y': 'auto'
      });
    };

    /*
     * This adds max height, but not overflow - the effect of this is that elements can grow beyond the max height,
     * but if they run off the top they're pushed down.
     *
     * If the element expands below the screen height it will be cut off, but we were already doing that.
     */
    var expandable = function (element, available) {
      setMaxHeight(element, available);
    };

    return {
      anchored: Fun.constant(anchored),
      expandable: Fun.constant(expandable)
    };
  }
);