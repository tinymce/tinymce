define(
  'ephox.alloy.api.system.SystemApi',

  [
    'ephox.scullion.Contracts'
  ],

  function (Contracts) {
    return Contracts.exactly([
      'debugInfo',
      'triggerFocus',
      'triggerEvent',
      'triggerEscape',
      // TODO: Implement later. See lab for details.
      // 'openPopup',
      // 'closePopup',
      'addToWorld',
      'removeFromWorld',
      'addToGui',
      'removeFromGui',
      'build',
      'getByUid',
      'getByDom',

      'broadcast',
      'broadcastOn'
    ]);
  }
);