define(
  'ephox.alloy.positioning.mode.Anchoring',

  [
    'ephox.katamari.api.Contracts'
  ],

  function (Contracts) {
    return Contracts.exactly([
      'anchorBox',
      'bubble',
      'overrides',
      'layouts',
      'placer'
    ]);
  }
);