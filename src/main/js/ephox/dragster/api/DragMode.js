define(
  'ephox.dragster.api.DragMode',

  [
    'ephox.scullion.Contracts'
  ],

  function (Contracts) {
    return Contracts.exactly([
      'compare',
      'extract',
      'predicate',
      'onStart',
      'onStop',
      'onExit',
      'onMove',
      'mutate'
    ]);
  }
);