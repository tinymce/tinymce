define(
  'ephox.dragster.style.Styles',

  [
    'ephox.katamari.api.Namespace'
  ],

  function (Namespace) {

    var styles = Namespace.css('ephox-dragster');

    return {
      resolve: styles.resolve
    };
  }
);
