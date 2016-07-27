define(
  'ephox.boulder.demo.BoulderDemo',

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
