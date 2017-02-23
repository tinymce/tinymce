define(
  'ephox.alloy.api.messages.Channels',

  [
    'ephox.katamari.api.Fun'
  ],

  function (Fun) {
    return {
      dismissPopups: Fun.constant('dismiss.popups')
    };
  }
);