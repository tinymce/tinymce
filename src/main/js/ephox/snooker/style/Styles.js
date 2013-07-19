define(
  'ephox.snooker.style.Styles',

  [
    'ephox.flour.style.Resolver'
  ],

  function (Resolver) {
    var styles = Resolver.create('ephox-snooker');

    return {
      resolve: styles.resolve
    };
  }
);
