define(
  'ephox.robin.api.general.ZoneViewports',

  [
    'ephox.peanut.Fun',
    'ephox.robin.api.general.ZonePosition'
  ],

  function (Fun, ZonePosition) {
    var anything = {
      assess: ZonePosition.inView
    };

    return {
      anything: Fun.constant(anything)
    };
  }
);