define(
  'ephox.snooker.style.Styles',

  [
    'ephox.katamari.api.Namespace'
  ],

  function (Namespace) {
    var styles = Namespace.css('ephox-snooker');

    return {
      resolve: styles.resolve
    };
  }
);
