define(
  'ephox.alloy.behaviour.sliding.ActiveSliding',

  [
    'ephox.alloy.behaviour.sliding.SlidingApis',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.Objects',
    'ephox.sugar.api.properties.Css'
  ],

  function (SlidingApis, EventHandler, DomModification, Objects, Css) {
    var exhibit = function (base, slideConfig/*, slideState */) {
      var expanded = slideConfig.expanded();

      return expanded ? DomModification.nu({
        classes: [ slideConfig.openClass() ],
        styles: { }
      }) : DomModification.nu({
        classes: [ slideConfig.closedClass() ],
        styles: Objects.wrap(slideConfig.dimension().property(), '0px')
      });
    };

    var events = function (slideConfig, slideState) {
      return {
        'transitionend': EventHandler.nu({
          run: function (component, simulatedEvent) {
            var raw = simulatedEvent.event().raw();
            // This will fire for all transitions, we're only interested in the dimension completion
            if (raw.propertyName === slideConfig.dimension().property()) {
              SlidingApis.disableTransitions(component, slideConfig, slideState); // disable transitions immediately (Safari animates the dimension removal below)
              if (slideState.isExpanded()) Css.remove(component.element(), slideConfig.dimension().property()); // when showing, remove the dimension so it is responsive
              var notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
              notify(component, simulatedEvent);
            }
          }
        })
      };
    };

    return {
      exhibit: exhibit,
      events: events
    };
  }
);