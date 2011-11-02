define(
  'ephox.porkbun.demo.Outlaw',

  [
    'ephox.wrap.JQuery'
  ],

  function($) {
    var create = function(name) {
      var container = $('<div />');
      container.css({  width: '1px dashed gray' });

      var character = $('<div />');
      character.css({ width: '200px', float: 'left' });

      var img = $('<img src="images/outlaw.jpg" />');
      img.height('200px');

      var actions = $('<div />');
      actions.css({ float: 'right', width: '60px' });

      var caption = $('<p>');
      caption.text(name);
      caption.css({ textAlign: 'center', fontWeight: 'bold' });
      caption.append(actions);

      character.append(img, caption);
      container.append(character);

      // Event for I've shot someone

      // Event for I've been shot

      var addAction = function(text, action) {
        var button = $('<button />');
        button.text(text);
        button.bind('click', action);
        
        actions.append(button);
      };

      var shoot = function(outlaw) {
        outlaw.die();
        // Fire my shoot event
      };

      var die = function() {
        img.attr('src', 'images/gravestone.jpg');
        // Fire I've died event
      };

      var getElement = function() {
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
