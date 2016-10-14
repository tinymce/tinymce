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
      // TODO: Implement later. See lab for details.
      // 'openPopup',
      // 'closePopup',
      'addToWorld',
      'removeFromWorld',
      'build',
      'getByUid',
      'getByDom',

      'broadcast',
      'broadcastOn'
    ]);
  }
);