define(
  'ephox.alloy.sliding.SlidingHeight',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldSchema',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Classes',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Height'
  ],

  function (EventHandler, DomModification, FieldSchema, Fun, Cell, Class, Classes, Css, Height) {
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
            styles: {
              height: '0px'
            }
          });
        };

        var disableTransitions = function (component, oInfo) {
          Classes.remove(component.element(), [ oInfo.showStyle(), oInfo.hideStyle() ]);
        };

        var doHide2 = function (component, oInfo) {
          Class.remove(component.element(), oInfo.openStyle());
          Class.add(component.element(), oInfo.closedStyle());

          Css.set(component.element(), 'height', '0px');
          Css.reflow(component.element());
        };

        var doShow2 = function (component, oInfo) {
          Class.remove(component.element(), oInfo.closedStyle());
          Class.add(component.element(), oInfo.openStyle());
          Css.remove(component.element(), 'height');
        };

        var doHide = function (component, oInfo) {
          oInfo.state().set(false);
          // Force current height to begin transition
          Css.set(component.element(), 'height', Height.get(component.element()) + 'px');
          Css.reflow(component.element());

          Class.add(component.element(), oInfo.hideStyle()); // enable transitions
          doHide2(component, oInfo);
        };

        // Showing is complex due to the inability to transition to "auto".
        // We also can't cache the height as the parents may have resized since it was last shown.
        var doShow = function (component, oInfo) {
          doShow2(component, oInfo);
          var expandedHeight = Height.get(component.element());
          doHide2(component, oInfo);

          Class.add(component.element(), oInfo.showStyle());
          doShow2(component, oInfo);
          Css.set(component.element(), 'height', expandedHeight + 'px');
          oInfo.state().set(true);
        };


        var toEvents = function (oInfo) {
          return {
            'transitionend': EventHandler.nu({
              run: function (component, simulatedEvent) {
                var raw = simulatedEvent.event().raw();
                // This will fire for all transitions, we're only interested in the height completion
                if (raw.propertyName === 'height') {
                  disableTransitions(component, oInfo); // disable transitions immediately (Safari animates the height removal below)
                  if (oInfo.state().get() === true) Css.remove(component.element(), 'height'); // when showing, remove the height so it is responsive
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
  }
);