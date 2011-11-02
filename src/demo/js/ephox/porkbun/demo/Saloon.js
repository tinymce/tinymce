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
        width: '500px',
        float: 'left'
      });

      var getElement = function() {
        return saloon;
      };

      // An event that notifies when a shot has been fired in the saloon

      var enter = function(outlaw) {
        var chair = $('<div />');
        chair.css({ border: '1px solid green', float: 'right', clear: 'both' });
        chair.append(outlaw.getElement());
        // Hey this outlaw is inside, listen for shoot, death, leaving - shotFired, outlawDied, outlawLeaving functions
        saloon.append(chair);
      };

      var stopListening = function(outlaw) {
        // Stop listening
      };

      var shotFired = function(source, target) {
        // Potential chain event?
      };

      var outlawDied = function(source, target) {
        stopListening(source);
      };

      var outlawLeaving = function(source, target) {
        stopListening(source);
        leave(source);
      };

      var leave = function(outlaw) {
        // Not my problem anymore
        stopListening(outlaw);
        
        var element = outlaw.getElement();
        var chair = element.parent();
        element.detach();
        chair.remove();
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
