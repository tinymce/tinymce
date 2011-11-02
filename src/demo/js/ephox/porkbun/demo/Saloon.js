define(
  'ephox.porkbun.demo.Saloon',

  [
    'ephox.wrap.JQuery'
  ],

  function($) {
    var create = function() {
      var saloon = $('<div />');
      saloon.css({
        border: '3px solid brown',
        backgroundImage: 'url(images/saloon.jpg)',
        backgroundRepeat: 'no-repeat',
        height: '500px',
        width: '700px',
        float: 'right'
      });

      var getElement = function() {
        return saloon;
      };

      // An event that notifies when a shot has been fired in the saloon

      var enter = function(outlaw) {
        var chair = $('<div />');
        chair.css({ float: 'right', clear: 'both' });
        chair.append(outlaw.getElement());
        // Hey this outlaw is inside me, I better listen for when/if he shoots someone
        saloon.append(chair);
      };

      var leave = function(outlaw) {
        // Not my problem anymore
        outlaw.getElement().detach();
      };

      return {
        getElement: getElement,
        enter: enter,
        leave: leave
      };
    };

    return {
      create: create
    };
  }
);
