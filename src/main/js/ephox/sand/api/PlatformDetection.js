define(
  'ephox.sand.api.PlatformDetection',

  [
    'ephox.katamari.api.Thunk',
    'ephox.sand.core.PlatformDetection',
    'global!navigator'
  ],

  function (Thunk, PlatformDetection, navigator) {
    var detect = Thunk.cached(function () {
      var userAgent = navigator.userAgent;
      return PlatformDetection.detect(userAgent);
    });

    return {
      detect: detect
    };
  }
);