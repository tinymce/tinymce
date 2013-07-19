define(
  'ephox.snooker.adjust.Blah',

  [
    'ephox.dragster.api.Dragger',
    'ephox.perhaps.Option',
    'ephox.porkbun.Event',
    'ephox.porkbun.Events',
    'ephox.snooker.adjust.Container',
    'ephox.snooker.adjust.Grow',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Height',
    'ephox.sugar.api.Width',
    'global!Math',
    'global!document'
  ],

  function (Dragger, Option, Event, Events, Container, Grow, Class, Element, Height, Width, Math, document) {
    return function () {
      var handles = Container();
      var events = Events.create({
        grow: Event(['x', 'y'])
      });

      var subject = Option.none();

      var onStop = function () {
        subject.each(function (c) {
          handles.show(c);
        });
      };

      var hacktastic = function (elem) {
        var w = Width.get(elem);
        Width.set(elem, w);
        return w - Width.get(elem);
      };

      var hacky = function (elem) {
        var h = Height.get(elem);
        Height.set(elem, h);
        return h - Height.get(elem);
      };

      var grower = Grow();
      grower.events.grow.bind(function (event) {
        subject.each(function (s) {
          var width = Width.get(s) + hacktastic(s);
          var height = Height.get(s) + hacktastic(s);
          var w = Math.max(1, width + event.x());
          var h = Math.max(1, height + event.y());
          Width.set(s, w);
          Height.set(s, h);
          events.trigger.grow(event.x(), event.y());
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
        destroy: destroy
      };
    };
  }
);
