define(
  'ephox.porkbun.demo.Saloon',

  [
    'ephox.wrap.JQuery',
    'ephox.porkbun.Events',
    'ephox.porkbun.Struct'
  ],

  function ($, Events, Struct) {
    var shotFiredEvent = Struct.immutable("saloon", "shooter", "target");

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

      var events = Events.create(['shotFired']);

      var enter = function (outlaw) {
        var chair = $('<div />');
        chair.css({ border: '1px dashed green', float: 'right', clear: 'both' });
        chair.append(outlaw.getElement());
        saloon.append(chair);

        var outlawEvents = outlaw.events;
        outlawEvents.shotFired.bind(shotFired);
        outlawEvents.haveBeenShot.bind(outlawDied);
      };

      var leave = function (outlaw) {
        // Not my problem anymore
        stopListening(outlaw);

        var element = outlaw.getElement();
        var chair = element.parent();
        element.detach();
        chair.remove();
      };

      var stopListening = function (outlaw) {
        var outlawEvents = outlaw.events;
        outlawEvents.shotFired.unbind(shotFired);
        outlawEvents.haveBeenShot.unbind(outlawDied);
      };

      var shotFired = function (event) {
        // Potential chain event?
        var shooter = event.shooter();
        var target = event.target();
        events.trigger.shotFired(shotFiredEvent(api, shooter, target));
      };

      var outlawDied = function (event) {
        stopListening(event.source());
      };

      var api = {
        getElement: getElement,
        enter: enter,
        leave: leave,
        events: events.registry
      };
      return api;
    };

    return {
      create: create
    };
  }
);
