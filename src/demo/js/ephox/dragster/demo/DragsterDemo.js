define(
  'ephox.dragster.demo.DragsterDemo',

  [
    'ephox.wrap.JQuery'
  ],

  function ($) {
    return function () {
      var container = $('<div/>').append('Hi.');
      $('#ephox-ui').append(container);
    };
  }
);
