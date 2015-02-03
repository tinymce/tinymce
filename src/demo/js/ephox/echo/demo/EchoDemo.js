define(
  'ephox.echo.demo.EchoDemo',

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
