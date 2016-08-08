define(
  'ephox.alloy.api.SystemApi',

  [
    'ephox.scullion.Contracts'
  ],

  function (Contracts) {
    return Contracts.exactly([
      'debugInfo',
      'triggerFocus',
      'triggerEvent',
      'openPopup',
      'closePopup',
      'addToLab',
      'removeFromLab',
      'build'
    ]);
  }
);