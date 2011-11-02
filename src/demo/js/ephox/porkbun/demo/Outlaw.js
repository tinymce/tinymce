define(
  'ephox.porkbun.demo.Outlaw',

  [
    'ephox.wrap.D',
    'ephox.wrap.JQuery',
    'ephox.porkbun.Events',
    'ephox.porkbun.Struct'
  ],

  function (D, $, Events, Struct) {
    var shotFiredEvent = Struct.immutable('shooter', 'target');
    var haveBeenShotEvent = Struct.immutable('source');

    var create = function (name) {
      var container = $('<div />');
      container.css({  width: '1px dashed gray' });

      var character = $('<div />');
      character.css({ width: '200px', float: 'left' });

      var img = $('<img src="images/outlaw.jpg" />');
      img.height('200px');

      var actions = $('<div />');
      actions.css({ float: 'right' });

      var caption = $('<p>');
      caption.text(name);
      caption.css({ textAlign: 'center', fontWeight: 'bold' });
      caption.append(actions);

      character.append(img, caption);
      container.append(character);

      var events = Events.create(['shotFired', 'haveBeenShot']);

      var alive = true;

      var addAction = function (text, action) {
        var button = $('<button />');
        button.text(text);
        button.bind('click', action);
        
        actions.append(button);
      };

      //there's a pattern here screaming to get out
      var inSaloon;
      var enter = function(saloon) {
        saloon.enter(api);
        inSaloon = saloon;
      };

      var chaseStarted = function (event) {
        if (alive) {
          if (event.target() === api) {
            leave();
          }
        } else {
          throw "I am dead"
        }
      };

      var leave = function() {
        inSaloon.leave(api);
        inSaloon = undefined;
      };

      var shoot = function (outlaw) {
        outlaw.die();
        events.trigger.shotFired(shotFiredEvent(api, outlaw));
      };

      var die = function () {
        alive = false;
        img.attr('src', 'images/gravestone.jpg');
        actions.remove();
        stayingAwayFrom.events.chasing.unbind(chaseStarted);
        events.trigger.haveBeenShot(haveBeenShotEvent(api));
      };

      var getElement = function () {
        return container;
      };

      //there's a pattern here screaming to get out
      var stayingAwayFrom;
      var stayAwayFrom = function(sherrif) {
        sherrif.events.chasing.bind(chaseStarted);
        stayingAwayFrom = sherrif;
      };

      var api = {
        name: D.getConstant(name),
        getElement: getElement,
        addAction: addAction,
        enter: enter,
        leave: leave,
        shoot: shoot,
        die: die,
        events: events.registry,
        stayAwayFrom: stayAwayFrom
      };
      return api;
    };

    return {
      create: create
    };
  }
);
