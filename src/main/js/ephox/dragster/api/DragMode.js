define(
  'ephox.dragster.api.DragMode',

  [
    'ephox.scullion.Contracts'
  ],

  function (Contracts) {
    return Contracts.exactly([
      'compare',
      'extract',
      'mutate',
      'sink'
    ]);
  }
);