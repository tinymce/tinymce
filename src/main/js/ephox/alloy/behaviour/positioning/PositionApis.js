define(
  'ephox.alloy.behaviour.positioning.PositionApis',

  [
    'ephox.alloy.positioning.layout.Anchor',
    'ephox.alloy.positioning.layout.Boxes',
    'ephox.alloy.positioning.layout.Origins',
    'ephox.alloy.positioning.layout.SimpleLayout',
    'ephox.alloy.positioning.mode.AnchorSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.view.Location',
    'global!window'
  ],

  function (Anchor, Boxes, Origins, SimpleLayout, AnchorSchema, ValueSchema, Css, Location, window) {
    var getFixedOrigin = function () {
      return Origins.fixed(0, 0, window.innerWidth, window.innerHeight);
    };

    var getRelativeOrigin = function (component) {
      // This container is the origin.
      var position = Location.absolute(component.element());
      return Origins.relative(position.left(), position.top());
    };

    var placeFixed = function (_component, origin, anchoring, posConfig, placee) {
      var anchor = Anchor.box(anchoring.anchorBox());
      // TODO: Overrides for expanding panel
      SimpleLayout.fixed(anchor, placee.element(), anchoring.bubble(), anchoring.layouts(), anchoring.overrides());
    };

    var placeRelative = function (component, origin, anchoring, posConfig, placee) {
      var bounds = posConfig.bounds().getOr(Boxes.view());

      SimpleLayout.relative(
        anchoring.anchorBox(),
        placee.element(),
        anchoring.bubble(),
        {
          bounds: bounds,
          origin: origin,
          preference: anchoring.layouts(),
          maxHeightFunction: function () { }
        }
      );
    };

    var place = function (component, origin, anchoring, posConfig, placee) {
      var f = posConfig.useFixed() ? placeFixed : placeRelative;
      f(component, origin, anchoring, posConfig, placee);
    };

    var position = function (component, posConfig, posState, anchor, placee) {
      var anchorage = ValueSchema.asStructOrDie('positioning anchor.info', AnchorSchema, anchor);
      var origin = posConfig.useFixed() ? getFixedOrigin() : getRelativeOrigin(component);

      // We set it to be fixed, so that it doesn't interfere with the layout of anything
      // when calculating anchors
      Css.set(placee.element(), 'position', 'fixed');

      var oldVisibility = Css.getRaw(placee.element(), 'visibility');
      // INVESTIGATE: Will hiding the popup cause issues for focus?
      Css.set(placee.element(), 'visibility', 'hidden');

      var placer = anchorage.placement();
      placer(component, posConfig, anchorage, origin).each(function (anchoring) {
        var doPlace = anchoring.placer().getOr(place);
        doPlace(component, origin, anchoring, posConfig, placee);
      });

      oldVisibility.fold(function () {
        Css.remove(placee.element(), 'visibility');
      }, function (vis) {
        Css.set(placee.element(), 'visibility', vis);
      });

      // We need to remove position: fixed put on by above code if it is not needed.
      if (
        Css.getRaw(placee.element(), 'left').isNone() &&
        Css.getRaw(placee.element(), 'top').isNone() &&
        Css.getRaw(placee.element(), 'right').isNone() &&
        Css.getRaw(placee.element(), 'bottom').isNone() &&
        Css.getRaw(placee.element(), 'position').is('fixed')
      ) Css.remove(placee.element(), 'position');
    };

    var getMode = function (component, pConfig, pState) {
      return pConfig.useFixed() ? 'fixed' : 'absolute';
    };

    return {
      position: position,
      getMode: getMode
    };
  }
);