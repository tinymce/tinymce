define(
  'ephox.echo.api.AriaGrab',

  [
    'ephox.sugar.api.Attr'
  ],

  function (Attr) {
    var set = function (element, bool) {
      Attr.set(element, 'aria-grabbed', bool);
    };


    return {
      set: set
    };
  }
);