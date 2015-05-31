define(
  'ephox.darwin.style.Styles',

  [
    'ephox.flour.style.Resolver'
  ],

  function (Resolver) {
    var styles = Resolver.create('ephox-darwin');

    return {
      resolve: styles.resolve
    };
  }
);