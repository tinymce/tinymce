define(
  'ephox.porkbun.demo.Sheriff',

  [
    'ephox.wrap.JQuery'
  ],

  function($) {
    var create = function() {
      var container = $('<div />');
      container.css({ float: 'left', width: "200px", textAlign: 'center' });

      var img = $('<img src="images/chuck-norris.jpg" />');
      img.height('200px');
      container.append(img);

      var shooter;
      var giveChase = $('<button />');
      giveChase.text("give chase");
      giveChase.attr('disabled', true);
      giveChase.bind('click', function() {
        //Fire a give giveChase event with shooter as the extra info
      });

      var actions = $('<div />');
      actions.css({ float: 'right' });
      actions.append(giveChase);

      var caption = $('<p>Sheriff</p>');
      caption.css({ textAlign: 'center', fontWeight: 'bold' });
      caption.append(actions);
      container.append(caption);

      var getElement = function() {
        return container;
      };

      var watch = function(saloon) {
        // Listen for shoot events happening in the saloon, listener is heardShot function
      };

      var heardShot = function(source, target) {
        giveChase.attr('disabled', false);
        shooter = source;
      };

      return {
        watch: watch,
        getElement: getElement
      };
    };

    return {
      create: create
    };
  }
);
