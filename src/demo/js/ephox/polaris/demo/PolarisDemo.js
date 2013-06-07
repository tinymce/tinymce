define(
  'ephox.polaris.demo.PolarisDemo',

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
