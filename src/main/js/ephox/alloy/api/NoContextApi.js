define(
  'ephox.alloy.api.NoContextApi',

  [
    'ephox.alloy.api.SystemApi',
    'ephox.peanut.Fun'
  ],

  function (SystemApi, Fun) {
    return function () {
      return SystemApi({
        debugInfo: Fun.constant('fake'),
        triggerEvent: Fun.die('The component must be in a context to send event: trigger'),
        triggerFocus: Fun.die('The component must be in a context to send event: triggerFocus'),
        openPopup: Fun.die('The component must be in a context to send event: openPopup'),
        closePopup: Fun.die('The component must be in a context to send event: closePopup'),
        addToLab: Fun.die('The component must be in a context to send event: addToLab'),
        removeFromLab: Fun.die('The component must be in a context to send event: removeFromLab'),
        build: Fun.die('The component must be in a context to send event: build')
      });
    };
  }
);