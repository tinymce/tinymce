define(
  'ephox.alloy.sliding.SlidingDimension',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Css'
  ],

  function (EventHandler, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Fun, Cell, Class, Classes, Css) {
    return function (dimensionProperty, getDimension) {

       var schema = [
        FieldSchema.strict('closedStyle'),
        FieldSchema.strict('openStyle'),
        FieldSchema.strict('hideStyle'),
        FieldSchema.strict('showStyle'),
        FieldSchema.state('state', function () {
          return Cell(false);
        }),
        FieldSchema.state('handler', function () {
          var schema = [ ];

          var doExhibit = function (oInfo, base) {
            return DomModification.nu({
              classes: [ oInfo.closedStyle() ],
              styles: Objects.wrap(dimensionProperty, '0px')
            });
          };

          var disableTransitions = function (component, oInfo) {
            Classes.remove(component.element(), [ oInfo.showStyle(), oInfo.hideStyle() ]);
          };

          var doHide2 = function (component, oInfo) {
            Class.remove(component.element(), oInfo.openStyle());
            Class.add(component.element(), oInfo.closedStyle());

            Css.set(component.element(), dimensionProperty, '0px');
            Css.reflow(component.element());
          };

          var doShow2 = function (component, oInfo) {
            Class.remove(component.element(), oInfo.closedStyle());
            Class.add(component.element(), oInfo.openStyle());
            Css.remove(component.element(), dimensionProperty);
          };

          var doHide = function (component, oInfo) {
            oInfo.state().set(false);
            // Force current dimension to begin transition
            Css.set(component.element(), dimensionProperty, getDimension(component.element()));
            Css.reflow(component.element());

            Class.add(component.element(), oInfo.hideStyle()); // enable transitions
            doHide2(component, oInfo);
          };

          // Showing is complex due to the inability to transition to "auto".
          // We also can't cache the dimension as the parents may have resized since it was last shown.
          var doShow = function (component, oInfo) {
            doShow2(component, oInfo);
            var expanded = getDimension(component.element());
            doHide2(component, oInfo);

            Class.add(component.element(), oInfo.showStyle());
            doShow2(component, oInfo);
            Css.set(component.element(), dimensionProperty, expanded);
            oInfo.state().set(true);
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
                  }
                }
              })
            };
          };

          var toApis = function (oInfo) {
            return {
              grow: function (comp) {
                doShow(comp, oInfo);
              },
              shrink: function (comp) {
                doHide(comp, oInfo);
              },
              hasGrown: function (comp) {
                return oInfo.state().get() === true;
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