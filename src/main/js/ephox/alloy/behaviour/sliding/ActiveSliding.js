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
      var dimension = slideConfig.dimension();

      return expanded ? DomModification.nu({
        classes: [ slideConfig.openClass() ],
        styles: { }
      }) : DomModification.nu({
        classes: [ slideConfig.closedClass() ],
        styles: dimension.initStyles()
      })
    };

    var events = function (slideConfig, slideState) {
      return {
        'transitionend': EventHandler.nu({
          run: function (component, simulatedEvent) {
            var raw = simulatedEvent.event().raw();
            // This will fire for all transitions, we're only interested in the dimension completion
            slideConfig.dimension().onDone()(raw).each(function (complete) {
               // disable transitions immediately (Safari animates the dimension removal below)
              SlidingApis.disableTransitions(component, slideConfig, slideState);
              complete(component, slideConfig, slideState);
              var notify = slideState.isExpanded() ? slideConfig.onGrown() : slideConfig.onShrunk();
              notify(component, simulatedEvent);
            });
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