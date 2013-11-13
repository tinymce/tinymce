define(
  'ephox.snooker.adjust.Blah',

  [
    'ephox.dragster.api.Dragger',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.adjust.Container',
    'ephox.snooker.adjust.Dimensions',
    'ephox.snooker.adjust.Mutation',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'global!Math',
    'global!document'
  ],

  function (Dragger, Option, Event, Events, Container, Dimensions, Mutation, Class, Element, Math, document) {
    return function () {
      var handles = Container();
      var events = Events.create({
        grow: Event(['x', 'y']),
        stop: Event([])
      });

      var subject = Option.none();

      var onStop = function () {
        subject.each(function (c) {
          handles.show(c);
        });
      };

      var grower = Mutation();
      grower.events.drag.bind(function (event) {
        subject.each(function (s) {
          console.log('subject: ', s.dom());
          Dimensions.adjust(s, event.xDelta(), event.yDelta());
          events.trigger.grow(event.xDelta(), event.yDelta());
        });
        handles.hide();
      });

      var drag = Dragger.transform(grower, {});

      drag.events.stop.bind(onStop);
      Class.add(drag.element());

      var open = function (target) {
        subject = Option.some(target);
        drag.on();
        handles.show(target);
      };

      var close = function () {
        drag.off();
        subject = Option.none();
        handles.hide();
      };

      var connect = function () {
        // handles.connect();
        handles.events.resize.bind(function (event) {
          var body = Element.fromDom(document.body);
          drag.go(body);
        });
      };

      var destroy = function () {
        handles.destroy();
        drag.destroy();
      };

      return {
        connect: connect,
        open: open,
        close: close,
        destroy: destroy,
        events: events.registry
      };
    };
  }
);
