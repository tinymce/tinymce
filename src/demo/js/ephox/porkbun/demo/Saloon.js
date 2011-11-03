define(
  'ephox.porkbun.demo.Saloon',

  [
    'ephox.wrap.JQuery',
    'ephox.porkbun.Events',
    'ephox.porkbun.Binder',
    'ephox.scullion.Struct'
  ],

  function ($, Events, Binder, Struct) {
    var create = function () {
      var saloon = $('<div />');
      saloon.css({
        border: '3px solid brown',
        backgroundImage: 'url(images/saloon.jpg)',
        backgroundRepeat: 'no-repeat',
        width: '500px',
        float: 'left'
      });

      var getElement = function () {
        return saloon;
      };

      var events = Events.create({
        shooting: Struct.immutable("shooter", "target")
      });

      var binder = Binder.create();

      var seat = function (patron) {
        var chair = $('<div />');
        chair.css({ border: '1px dashed green', float: 'right', clear: 'both' });
        chair.append(patron.getElement());
        saloon.append(chair);
      };

      var unseat = function (patron) {
        var element = patron.getElement();
        var chair = element.parent();
        element.detach();
        chair.remove();
      };

      var enter = function (outlaw) {
        seat(outlaw);

        binder.bind(outlaw.events.shoot, function (event) {
          events.trigger.shooting(outlaw, event.target());
        });

        binder.bind(outlaw.events.die, function (event) {
          stopListening(outlaw);
        });
      };

      var leave = function (outlaw) {
        unseat(outlaw);
        stopListening(outlaw);
      };

      var stopListening = function (outlaw) {
        binder.unbind(outlaw.events.shoot);
        binder.unbind(outlaw.events.die);
      };

      return {
        getElement: getElement,
        events: events.registry,
        enter: enter,
        leave: leave
      };
    };

    return {
      create: create
    };
  }
);
