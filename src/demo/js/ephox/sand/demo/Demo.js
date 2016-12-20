define(
  'ephox.sand.demo.Demo',

  [
    'ephox.sand.api.PlatformDetection',
    'global!document'
  ],

  function (PlatformDetection, document) {
    return function () {
      var platform = PlatformDetection.detect();

      var ephoxUi = document.querySelector('#ephox-ui');
      ephoxUi.innerHTML = 'You are using: ' + platform.browser.current;
    };
  }
);

