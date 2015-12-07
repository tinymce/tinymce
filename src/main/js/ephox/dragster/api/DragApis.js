define(
  'ephox.dragster.api.DragApis',

  [
    'ephox.scullion.Contracts'
  ],

  function (Contracts) {
    var mode = Contracts.exactly([
      'compare',
      'extract',
      'mutate',
      'sink'
    ]);

    var sink = Contracts.exactly([
      'element',
      'start',
      'stop',
      'destroy'
    ]);

    var api = Contracts.exactly([
      'forceDrop',
      'drop',
      'move',
      'delayDrop'
    ]);

    return {
      mode: mode,
      sink: sink,
      api: api
    };
  }
);