define(
  'ephox.snooker.api.ResizeDirection',

  [
    'ephox.snooker.resize.BarPositions'
  ],

  function (BarPositions) {
    return {
      ltr: BarPositions.ltr,
      rtl: BarPositions.rtl
    };
  }
);