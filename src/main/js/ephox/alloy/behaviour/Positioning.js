define(
  'ephox.alloy.behaviour.Positioning',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.positioning.AnchorSchema',
    'ephox.alloy.positioning.Anchoring',
    'ephox.alloy.positioning.PopupSpi',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.repartee.api.Callouts',
    'ephox.repartee.api.Origins',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Location',
    'ephox.sugar.api.Remove',
    'global!window'
  ],

  function (Behaviour, DomModification, AnchorSchema, Anchoring, PopupSpi, FieldPresence, FieldSchema, ValueSchema, Fun, Callouts, Origins, Css, Insert, Location, Remove, window) {
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

    var getLayout = function (direction, layout) {
      return direction.isRtl() ? [ layout.southwest, layout.southeast, layout.northwest, layout.northeast ] : [ layout.southeast, layout.southwest, layout.northeast, layout.northwest ];
    };

    var place = function (origin, placement, posInfo, popup) {
      var optBounds = posInfo.bounds();
      var bounds = Origins.viewport(origin, optBounds);

      var bubble = placement.bubble();
      var anchorBox = placement.anchorBox();

      // TODO: Fix this.
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
    };

    var position = function (component, posInfo, anchor, placee) {
      var anchorage = ValueSchema.asStructOrDie('positioning anchor.info', AnchorSchema, anchor);
      var origin = posInfo.useFixed() ? getFixedOrigin() : getRelativeOrigin(component);

      var placer = anchorage.placement();
      
      placer(component, posInfo, anchorage, origin).each(function (placement) {

        Css.set(placee.element(), 'position', 'fixed');
        // Does this cause problems for focus?
        Css.set(placee.element(), 'visibility', 'hidden');

        var popup = PopupSpi(placee);
        place(origin, placement, posInfo, popup);

        Css.remove(placee.element(), 'visibility');
      });
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
          classes: [ 'ephox-alloy-popup-container' ],
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