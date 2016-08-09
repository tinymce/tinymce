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
      focus: Fun.constant('alloy.focus'),

      // This event is fired a small amount of time after the blur has fired. This 
      // allows the handler to know what was the focused element, and what is now.
      postBlur: Fun.constant('alloy.blur.post'),

      // This event is fired by gui.broadcast*. It is defined by 'receivers'
      receive: Fun.constant('alloy.receive')
    };
  }
);