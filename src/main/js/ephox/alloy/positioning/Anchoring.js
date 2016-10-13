define(
  'ephox.alloy.positioning.Anchoring',

  [
    'ephox.scullion.Contracts'
  ],

  function (Contracts) {
    return Contracts.exactly([
      'anchorBox',
      'bubble',
      'overrides',
      'layouts'
    ]);
  }
);