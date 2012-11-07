define(
  'ephox.robin.demo.RobinDemo',

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
