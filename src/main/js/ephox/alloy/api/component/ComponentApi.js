define(
  'ephox.alloy.api.component.ComponentApi',

  [
    'ephox.katamari.api.Contracts'
  ],

  function (Contracts) {
    return Contracts.exactly([
      'getSystem',
      'config',
      'hasConfigured',
      'spec',
      'connect',
      'disconnect',
      'element',
      'syncComponents',
      'readState',
      'components',
      'events'
    ]);
  }
);
