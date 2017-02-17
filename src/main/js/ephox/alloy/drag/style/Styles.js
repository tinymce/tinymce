define(
  'ephox.dragster.style.Styles',

  [
    'ephox.flour.style.Resolver'
  ],

  function (Resolver) {

    var styles = Resolver.create('ephox-dragster');

    return {
      resolve: styles.resolve
    };
  }
);
