define(
  'ephox.porkbun.demo.Saloon',

  [
    'ephox.wrap.JQuery',
    'ephox.porkbun.Events',
    'ephox.scullion.Struct'
  ],

  function ($, Events, Struct) {
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

      var enter = function (outlaw) {
        var chair = $('<div />');
        chair.css({ border: '1px dashed green', float: 'right', clear: 'both' });
        chair.append(outlaw.getElement());
        saloon.append(chair);

        outlaw.events.shotFired.bind(shotFired);
        outlaw.events.haveBeenShot.bind(outlawDied);
      };

      var leave = function (outlaw) {
        stopListening(outlaw);

        var element = outlaw.getElement();
        var chair = element.parent();
        element.detach();
        chair.remove();
      };

      var stopListening = function (outlaw) {
        outlaw.events.shotFired.unbind(shotFired);
        outlaw.events.haveBeenShot.unbind(outlawDied);
      };

      var shotFired = function (event) {
        var shooter = event.shooter();
        var target = event.target();
        events.trigger.shotFired(shooter, target);
      };

      var outlawDied = function (event) {
        stopListening(event.source());
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
