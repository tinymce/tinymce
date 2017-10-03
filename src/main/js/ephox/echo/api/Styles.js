define(
  'ephox.echo.api.Styles',

  [
    'ephox.katamari.api.Namespace'
  ],

  function (Namespace) {
    var styles = Namespace.css('ephox-echo');

    return {
      resolve: styles.resolve
    };
  }
);
