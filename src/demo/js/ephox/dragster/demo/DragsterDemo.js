define(
  'ephox.dragster.demo.DragsterDemo',

  [
    'ephox.wrap.JQuery',
    'ephox.dragster.api.Dragster'
  ],

  function ($, Dragster) {
    return function () {
      var container = $('<div/>').append('Hi.');

      var dialog = Dragster('Example');

      container.append(dialog.element().dom());

      $('#ephox-ui').append(container);

      dialog.show(10, 10);
    };
  }
);
