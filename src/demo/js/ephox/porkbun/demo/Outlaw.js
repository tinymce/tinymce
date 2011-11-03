define(
  'ephox.porkbun.demo.Outlaw',

  [
    'ephox.wrap.D',
    'ephox.wrap.JQuery',
    'ephox.porkbun.Events',
    'ephox.scullion.Struct'
  ],

  function (D, $, Events, Struct) {
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

      var getElement = function () {
        return container;
      };

      var addAction = function (text, action) {
        var button = $('<button />');
        button.text(text);
        button.bind('click', action);

        actions.append(button);
      };

      var events = Events.create({
        shoot: Struct.immutable('target'),
        die: Struct.immutable()
      });

      var establishment;
      var enter = function (saloon) {
        saloon.enter(api);
        establishment = saloon;
      };

      var leave = function () {
        establishment.leave(api);
        establishment = undefined;
      };

      var shoot = function (target) {
        target.die();
        events.trigger.shoot(target);
      };

      var die = function () {
        img.attr('src', 'images/gravestone.jpg');
        actions.remove();
        events.trigger.die();
      };

      var chase = function () {
        leave();
      };

      var api = {
        getElement: getElement,
        addAction: addAction,
        events: events.registry,
        enter: enter,
        leave: leave,
        shoot: shoot,
        die: die,
        chase: chase
      };

      return api;
    };

    return {
      create: create
    };
  }
);
