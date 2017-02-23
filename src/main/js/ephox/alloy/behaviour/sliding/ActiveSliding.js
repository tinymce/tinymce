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
    var exhibit = function (base, slideInfo) {
      var expanded = slideInfo.expanded();

      return expanded ? DomModification.nu({
        classes: [ slideInfo.openClass() ],
        styles: { }
      }) : DomModification.nu({
        classes: [ slideInfo.closedClass() ],
        styles: Objects.wrap(slideInfo.dimension().property(), '0px')
      });
    };

    var events = function (slideInfo) {
      return {
        'transitionend': EventHandler.nu({
          run: function (component, simulatedEvent) {
            var raw = simulatedEvent.event().raw();
            // This will fire for all transitions, we're only interested in the dimension completion
            if (raw.propertyName === slideInfo.dimension().property()) {
              SlidingApis.disableTransitions(component, slideInfo); // disable transitions immediately (Safari animates the dimension removal below)
              if (slideInfo.state().get() === true) Css.remove(component.element(), slideInfo.dimension().property()); // when showing, remove the dimension so it is responsive
              var notify = slideInfo.state().get() === true ? slideInfo.onGrown() : slideInfo.onShrunk();
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