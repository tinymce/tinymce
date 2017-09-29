define(
  'ephox.darwin.style.Styles',

  [
    'ephox.katamari.api.Namespace'
  ],

  function (Namespace) {
    var styles = Namespace.css('ephox-darwin');

    return {
      resolve: styles.resolve
    };
  }
);