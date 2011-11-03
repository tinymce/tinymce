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
        shotFired: Struct.immutable("shooter", "target")
      });

      var binder = Binder.create();

      var enter = function (outlaw) {
        var chair = $('<div />');
        chair.css({ border: '1px dashed green', float: 'right', clear: 'both' });
        chair.append(outlaw.getElement());
        saloon.append(chair);

        binder.bind(outlaw.events.shoot, function (event) {
          var shooter = outlaw;
          var target = event.target();
          events.trigger.shotFired(shooter, target);
        });

        binder.bind(outlaw.events.die, function (event) {
          stopListening(outlaw);
        });
      };

      var leave = function (outlaw) {
        stopListening(outlaw);

        var element = outlaw.getElement();
        var chair = element.parent();
        element.detach();
        chair.remove();
      };

      var stopListening = function (outlaw) {
        binder.unbind(outlaw.events.shoot);
        binder.unbind(outlaw.events.die);
      };

      return {
        getElement: getElement,
        enter: enter,
        leave: leave,
        events: events.registry
      };
    };

    return {
      create: create
    };
  }
);
