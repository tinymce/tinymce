define(
  'ephox.porkbun.demo.Outlaw',

  [
    'ephox.wrap.JQuery'
  ],

  function($) {
    var create = function() {
      var container = $('<div />');
      container.css({ width: "200px", textAlign: 'center' });

      var img = $('<img src="images/outlaw.jpg" />');
      img.height('200px');
      container.append(img);

      var caption = $('<p>Outlaw</p>');
      caption.css({ textAlign: 'center', fontWeight: 'bold' });
      container.append(caption);

      // Event for I've shot someone

      // Event for I've been shot

      var shoot = function(outlaw) {
        outlaw.die();
        // Fire my shoot event
      };

      var die = function() {
        img.src = "images/gravestone.jpg";
        // Fire I've died event
      };

      var getElement = function() {
        return container;
      };

      return {
        getElement: getElement
      };
    };

    return {
      create: create
    };
  }
);
