define(
  'ephox.porkbun.demo.Sheriff',

  [
    'ephox.wrap.JQuery',
    'ephox.porkbun.Events',
    'ephox.porkbun.Struct'
  ],

  function ($, Events, Struct) {
    var chasingEvent = Struct.immutable('target');

    var create = function () {
      var container = $('<div />');
      container.css({ float: 'left', width: "200px", textAlign: 'center' });

      var img = $('<img src="images/chuck-norris.jpg" />');
      img.height('200px');
      container.append(img);

      var events = Events.create(['chasing']);

      var shooter;
      var giveChase = $('<button disabled="true">Give chase</button>');
      giveChase.bind('click', function () {
        events.trigger.chasing(chasingEvent(shooter));
      });

      var actions = $('<div />');
      actions.css({ float: 'right' });
      actions.append(giveChase);

      var caption = $('<p>Sheriff</p>');
      caption.css({ textAlign: 'center', fontWeight: 'bold' });
      caption.append(actions);
      container.append(caption);

      var getElement = function () {
        return container;
      };

      var watch = function (saloon) {
        saloon.events.shotFired.bind(heardShot);
      };

      var heardShot = function (event) {
        giveChase.attr('disabled', false);
        shooter = event.shooter();
      };

      return {
        watch: watch,
        getElement: getElement,
        events: events.registry
      };
    };

    return {
      create: create
    };
  }
);
