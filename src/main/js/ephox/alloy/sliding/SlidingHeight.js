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

    /*
    var schema = 
    var closedStyle = Styles.resolve('toolbar-more-closed');
    var openStyle = Styles.resolve('toolbar-more-open');
    var hideStyle = Styles.resolve('toolbar-more-hide');
    var showStyle = Styles.resolve('toolbar-more-show');

    var setAndReflow = function (e, height) {
      Css.set(e, 'height', height + 'px');
      Css.reflow(e);
    };

    var hideMore = function (e) {
      Class.remove(e, openStyle);
      Class.add(e, closedStyle);
      setAndReflow(e, 0);
    };

    var showMore = function (e) {
      Class.remove(e, closedStyle);
      Class.add(e, openStyle);
      Css.remove(e, 'height');
    };

    return function (element) {
      hideMore(element);

      var showing = false;

      // Hiding is easy.
      var hide = function () {
        showing = false;
        setAndReflow(element, Height.get(element));   // force current height to begin transition
        Class.add(element, hideStyle);                // enable transitions
        hideMore(element);                            // set hidden
      };

      // Showing is complex due to the inability to transition to "auto".
      // We also can't cache the height as the editor may have resized since it was last shown.
      var show = function () {
        showMore(element);                        // show (temporarily)
        var moreHeight = Height.get(element);     // measure height
        hideMore(element);                        // hide again
        Class.add(element, showStyle);            // enable transitions
        showMore(element);                        // show
        setAndReflow(element, moreHeight);        // We can't transition to "auto", force desired size, heightHandler will remove
        showing = true;
      };

      var heightHandler = DomEvent.bind(element, 'transitionend', function (event) {
        // This will fire for all transitions, we're only interested in the height completion
        if (event.raw().propertyName === 'height') {
          Classes.remove(element, [showStyle, hideStyle]); // disable transitions immediately (Safari animates the height removal below)
          if (showing) Css.remove(element, 'height');      // when showing, remove the height so it is responsive
        }
      });

      var visible = function () {
        return showing;
      };

      var destroy = function () {
        heightHandler.unbind();
      };

      return {
        visible: visible,
        hide: hide,
        show: show,
        destroy: destroy
      };

    };
    */
  }
);