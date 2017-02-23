define(
  'ephox.alloy.sliding.SlidingDimension',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Cell',
    'ephox.sugar.api.properties.Class',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.properties.Css'
  ],

  function (EventHandler, DomModification, FieldSchema, Objects, Fun, Cell, Class, Classes, Css) {
    return function (dimensionProperty, getDimension) {

       var schema = [
        FieldSchema.strict('closedClass'),
        FieldSchema.strict('openClass'),
        FieldSchema.strict('shrinkingClass'),
        FieldSchema.strict('growingClass'),

        // Element which shrinking and growing animations
        FieldSchema.option('getAnimationRoot'),

        FieldSchema.defaulted('onShrunk', function () { }),
        FieldSchema.defaulted('onStartShrink', function () { }),
        FieldSchema.defaulted('onGrown', function () { }),
        FieldSchema.defaulted('onStartGrow', function () { }),
        FieldSchema.defaulted('expanded', false),
        FieldSchema.state('state', function (spec) {
          return Cell(spec.expanded === true);
        }),
        FieldSchema.state('handler', function () {
          var schema = [ ];

          var getAnimationRoot = function (component, oInfo) {
            return oInfo.getAnimationRoot().fold(function () {
              return component.element();
            }, function (get) {
              return get(component);
            });
          };

          var doExhibit = function (oInfo, base) {
            var expanded = oInfo.expanded();
            return expanded ? DomModification.nu({
              classes: [ oInfo.openClass() ],
              styles: { }
            }) : DomModification.nu({
              classes: [ oInfo.closedClass() ],
              styles: Objects.wrap(dimensionProperty, '0px')
            });
          };

          var disableTransitions = function (component, oInfo) {
            var root = getAnimationRoot(component, oInfo);
            Classes.remove(root, [ oInfo.shrinkingClass(), oInfo.growingClass() ]);
          };

          var setShrunk = function (component, oInfo) {
            Class.remove(component.element(), oInfo.openClass());
            Class.add(component.element(), oInfo.closedClass());

            Css.set(component.element(), dimensionProperty, '0px');
            Css.reflow(component.element());
          };

          // Note, this is without transitions, so we can measure the size instantaneously
          var measureTargetSize = function (component, oInfo) {
            setGrown(component, oInfo);
            var expanded = getDimension(component.element());
            setShrunk(component, oInfo);
            return expanded;
          };

          var setGrown = function (component, oInfo) {
            Class.remove(component.element(), oInfo.closedClass());
            Class.add(component.element(), oInfo.openClass());
            Css.remove(component.element(), dimensionProperty);
            // Reflow?
          };

          var immediateShrink = function (component, oInfo) {
             oInfo.state().set(false);

            // Force current dimension to begin transition
            Css.set(component.element(), dimensionProperty, getDimension(component.element()));
            Css.reflow(component.element());

            disableTransitions(component, oInfo);

            setShrunk(component, oInfo);
            oInfo.onStartShrink()(component);
            oInfo.onShrunk()(component);
          };

          var startShrink = function (component, oInfo) {
            oInfo.state().set(false);

            // Force current dimension to begin transition
            Css.set(component.element(), dimensionProperty, getDimension(component.element()));
            Css.reflow(component.element());

            var root = getAnimationRoot(component, oInfo);
            Class.add(root, oInfo.shrinkingClass()); // enable transitions
            setShrunk(component, oInfo);
            oInfo.onStartShrink()(component);
          };

          // Showing is complex due to the inability to transition to "auto".
          // We also can't cache the dimension as the parents may have resized since it was last shown.
          var startGrow = function (component, oInfo) {
            var fullSize = measureTargetSize(component, oInfo);
            
            // Start the growing animation styles
            var root = getAnimationRoot(component, oInfo);
            Class.add(root, oInfo.growingClass());

            setGrown(component, oInfo);
            Css.set(component.element(), dimensionProperty, fullSize);
            oInfo.state().set(true);
            oInfo.onStartGrow()(component);
          };


          var toEvents = function (oInfo) {
            return {
              'transitionend': EventHandler.nu({
                run: function (component, simulatedEvent) {
                  var raw = simulatedEvent.event().raw();
                  // This will fire for all transitions, we're only interested in the dimension completion
                  if (raw.propertyName === dimensionProperty) {
                    disableTransitions(component, oInfo); // disable transitions immediately (Safari animates the dimension removal below)
                    if (oInfo.state().get() === true) Css.remove(component.element(), dimensionProperty); // when showing, remove the dimension so it is responsive
                    var notify = oInfo.state().get() === true ? oInfo.onGrown() : oInfo.onShrunk();
                    notify(component, simulatedEvent);
                  }
                }
              })
            };
          };

          var toApis = function (oInfo) {
            return {
              grow: function (comp) {
                if (oInfo.state().get() !== true) startGrow(comp, oInfo);
              },
              shrink: function (comp) {
                if (oInfo.state().get() !== false) startShrink(comp, oInfo);
              },
              immediateShrink: function (comp) {
                if (oInfo.state().get() !== false) immediateShrink(comp, oInfo);
              },
              hasGrown: function (comp) {
                return oInfo.state().get() === true;
              },
              toggleGrow: function (comp) {
                var f = oInfo.state().get() === true ? startShrink : startGrow;
                f(comp, oInfo);
              }
            };
          };

          return {
            doExhibit: doExhibit,
            toEvents: toEvents,
            toApis: toApis,
            schema: Fun.constant(schema)
          };
        })

      ];



      return schema;

    };
   
  }
);