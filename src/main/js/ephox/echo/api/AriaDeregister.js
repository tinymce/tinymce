define(
  'ephox.echo.api.AriaDeregister',

  [
    'ephox.sugar.api.Attr'
  ],

  function (Attr) {
    var describedBy = function (element) {
      Attr.remove(element, 'aria-describedby');
    };

    return {
      describedBy: describedBy
    };
  }
);