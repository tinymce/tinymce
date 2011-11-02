define(
  'ephox.porkbun.demo.Sheriff',

  [
    'ephox.wrap.JQuery'
  ],

  function($) {
    var create = function() {
      var container = $('<div />');
      container.css({ width: "200px", textAlign: 'center' });

      var img = $('<img src="images/chuck-norris.jpg" />');
      img.height('200px');
      container.append(img);

      var caption = $('<p>Sheriff</p>');
      caption.css({ textAlign: 'center', fontWeight: 'bold' });
      container.append(caption);

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
