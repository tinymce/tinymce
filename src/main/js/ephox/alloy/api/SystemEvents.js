define(
  'ephox.alloy.api.SystemEvents',

  [
    'ephox.peanut.Fun'
  ],

  function (Fun) {
    return {
      // This is used to pass focus to a component. A component might interpret
      // this event and pass the DOM focus to one of its children, depending on its
      // focus model.
      focus: Fun.constant('alloy.focus')
    };
  }
);