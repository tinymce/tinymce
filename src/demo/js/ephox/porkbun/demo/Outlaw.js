define(
  'ephox.porkbun.demo.Outlaw',

  [
    'ephox.wrap.JQuery',
    'ephox.porkbun.Events'
  ],

  function ($, Events) {
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

      // Create Event for I've shot someone

      // Create Event for I've been shot

      // Listen to "give chase" events, listener is chaseStarted function

      var events = Events.create(['shotFired', 'haveBeenShot']);

      var chaseStarted = function (source, target) {
        if (alive) {
          // TODO: check if target is me? Is that even possible?
          // Fire a leaving event
        } else {
          throw "I am dead"
        }
      };

      var alive = true;

      var addAction = function (text, action) {
        var button = $('<button />');
        button.text(text);
        button.bind('click', action);
        
        actions.append(button);
      };

      var shoot = function (outlaw) {
        outlaw.die();
        // Fire my shoot event
      };

      var die = function () {
        alive = false;
        img.attr('src', 'images/gravestone.jpg');
        actions.remove();
        // Fire I've died event
      };

      var getElement = function () {
        return container;
      };

      return {
        getElement: getElement,
        addAction: addAction,
        shoot: shoot,
        die: die
      };
    };

    return {
      create: create
    };
  }
);
