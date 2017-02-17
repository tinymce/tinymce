define(
  'ephox.alloy.api.messages.Channels',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return {
      dismissPopups: Fun.constant('dismiss.popups')
    };
  }
);