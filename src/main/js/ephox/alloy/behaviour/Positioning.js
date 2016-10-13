define(
  'ephox.alloy.behaviour.Positioning',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.positioning.AnchorSchema',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.repartee.api.Anchor',
    'ephox.repartee.api.Boxes',
    'ephox.repartee.api.Origins',
    'ephox.repartee.api.SimpleLayout',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'global!window'
  ],

  function (Behaviour, DomModification, AnchorSchema, FieldPresence, FieldSchema, ValueSchema, Fun, Option, Anchor, Boxes, Origins, SimpleLayout, Css, Insert, Location, Remove, window) {
    var schema = FieldSchema.field(
      'positioning',
      'positioning',
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.defaulted('useFixed', false),
        FieldSchema.option('bounds')
      ])
    );

    var getFixedOrigin = function () {
      return Origins.fixed(0, 0, window.innerWidth, window.innerHeight);
    };

    var getRelativeOrigin = function (component) {
      // This container is the origin.
      var position = Location.absolute(component.element());
      return Origins.relative(position.left(), position.top());
    };

    var placeFixed = function (_component, origin, anchoring, posInfo, placee) {
      var anchor = Anchor.box(anchoring.anchorBox());
      // TODO: Overrides for expanding panel
      SimpleLayout.fixed(anchor, placee.element(), anchoring.bubble(), anchoring.layouts(), anchoring.overrides());
    };

    var placeRelative = function (component, origin, anchoring, posInfo, placee) {
      var bounds = posInfo.bounds().getOr(Boxes.view());

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

    var place = function (component, origin, anchoring, posInfo, placee) {
      var f = posInfo.useFixed() ? placeFixed : placeRelative;
      f(component, origin, anchoring, posInfo, placee);

      /*
      var optBounds = posInfo.bounds();
      var bounds = Origins.viewport(origin, optBounds);

      var bubble = placement.bubble();
      var anchorBox = placement.anchorBox();

      // TODO: Add RTL support.
      var direction = { isRtl: function () { return false; }};

      var preference = getLayout(direction, placement.layouts());

      var options = {
        bounds: bounds,
        origin: origin,
        preference:  preference,
        maxHeightFunction: placement.maxHeightFunction()
      };

      var decision = Callouts.layout(anchorBox, popup, bubble, options);
      Callouts.position(popup, direction, decision, origin);

      Callouts.setClasses(popup, decision);
      Callouts.setHeight(anchorBox, popup, decision, options, bubble);
      */
    };

    var position = function (component, posInfo, anchor, placee) {
      var anchorage = ValueSchema.asStructOrDie('positioning anchor.info', AnchorSchema, anchor);
      var origin = posInfo.useFixed() ? getFixedOrigin() : getRelativeOrigin(component);

      // We set it to be fixed, so that it doesn't interfere with the layout of anything
      // when calculating anchors
      Css.set(placee.element(), 'position', 'fixed');
      // INVESTIGATE: Will hiding the popup cause issues for focus?
      Css.set(placee.element(), 'visibility', 'hidden');

      var placer = anchorage.placement();
      placer(component, posInfo, anchorage, origin).each(function (anchoring) {
        place(component, origin, anchoring, posInfo, placee);
      });
      Css.remove(placee.element(), 'visibility');
    };

    var addContainer = function (component, posInfo, sandbox) {
      Insert.append(component.element(), sandbox.element());
    };

    var removeContainer = function (component, posInfo, sandbox) {
      Remove.remove(sandbox.element());
    };

    var exhibit = function (info) {
      return info.positioning().fold(function () {
        return DomModification.nu({});
      }, function (posInfo) {
        return DomModification.nu({
          classes: [ ],
          styles: posInfo.useFixed() ? { } : { position: 'relative' }
        });
      });
    };

    var apis = function (info) {
      return {
        position: Behaviour.tryActionOpt('positioning', info, 'position', position),
        addContainer: Behaviour.tryActionOpt('positioning', info, 'addContainer', addContainer),
        removeContainer: Behaviour.tryActionOpt('positioning', info, 'removeContainer', removeContainer)
      };
    };

    return Behaviour.contract({
      name: Fun.constant('positioning'),
      schema: Fun.constant(schema),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: apis
    });
  }
);