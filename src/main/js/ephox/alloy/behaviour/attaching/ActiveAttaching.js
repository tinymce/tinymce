define(
  'ephox.alloy.behaviour.attaching.ActiveAttaching',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.behaviour.common.Behaviour',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Thunk',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.properties.Html',
    'ephox.sugar.api.search.Traverse'
  ],

  function (SystemEvents, Behaviour, EventHandler, Objects, Fun, Thunk, Insert, Element, Css, Html, Traverse) {
    var attachAnimation = 'alloyAttachAnimation';

    var addKeyframes = Thunk.cached(function (element) {
      var doc = Traverse.owner(element);
      var head = Element.fromDom(doc.dom().head);
      var style = Element.fromTag('style');
      // NOTE: outline-color initial->initial did not work in Edge
      // This approach inspired is by http://jsfiddle.net/Zzw2M/103/ and 
      // http://www.backalleycoder.com/2012/04/25/i-want-a-damnodeinserted/
      Html.set(style, '@keyframes ' + attachAnimation + '{ from { outline-color: white; } to { outline-color: black; } }\n');
      Insert.append(head, style);
    });

    var events = function (attachInfo) {
      var called = false;

      return Objects.wrapAll([
        Behaviour.loadEvent(attachInfo, function (component, _) {
          addKeyframes(component.element());
          Css.setAll(component.element(), {
            'animation-name': attachAnimation,
            'animation-duration': '0.1s'
          });
        }),
        {
          key: 'animationstart',
          value: EventHandler.nu({
            run: function (component, simulatedEvent) {
              if (! called && simulatedEvent.event().raw().animationName === attachAnimation) {
                component.getSystem().triggerEvent(
                  SystemEvents.attachedToDom(),
                  component.element(),
                  {
                    target: Fun.constant(component.element())
                  }
                );
                called = true;
                Css.remove(component.element(), 'animation-name');
                Css.remove(component.element(), 'animation-duration');
              }
            }
          })
        }
      ]);
    };

    return {
      events: events
    };
  }
);
