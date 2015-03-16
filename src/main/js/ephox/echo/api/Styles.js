define(
  'ephox.echo.api.Styles',

  [
    'ephox.flour.style.Resolver'
  ],

  function (Resolver) {
    var styles = Resolver.create('ephox-echo');

    return {
      resolve: styles.resolve
    };
  }
);
