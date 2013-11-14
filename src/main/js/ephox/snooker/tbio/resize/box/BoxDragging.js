define(
  'ephox.snooker.tbio.resize.box.BoxDragging',

  [
    'ephox.dragster.api.Dragger',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.adjust.Dimensions',
    'ephox.snooker.tbio.resize.box.BoxHandles',
    'ephox.snooker.tbio.resize.common.Mutation',
    'ephox.sugar.api.Element',
    'global!Math',
    'global!document'
  ],

  function (Dragger, Option, Event, Events, Dimensions, BoxHandles, Mutation, Element, Math, document) {
    return function () {
      var handles = BoxHandles();
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
          Dimensions.adjust(s, event.xDelta(), event.yDelta());
          events.trigger.grow(event.xDelta(), event.yDelta());
        });
        handles.hide();
      });

      var drag = Dragger.transform(grower, {});

      drag.events.stop.bind(onStop);

      var assign = function (target) {
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
        assign: assign,
        close: close,
        destroy: destroy,
        events: events.registry
      };
    };
  }
);
