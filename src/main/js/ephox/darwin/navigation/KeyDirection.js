define(
  'ephox.darwin.navigation.KeyDirection',

  [
    'ephox.darwin.keyboard.Retries',
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.fussy.api.Situ',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.sugar.api.Traverse'
  ],

  function (Retries, BeforeAfter, Situ, DomGather, Traverse) {
    return {
      down: {
        traverse: Traverse.nextSibling,
        gather: DomGather.after,
        relative: Situ.before,
        otherRetry: Retries.tryDown,
        ieRetry: Retries.ieTryDown,
        failure: BeforeAfter.adt.failedDown
      },
      up: {
        traverse: Traverse.prevSibling,
        gather: DomGather.before,
        relative: Situ.before,
        otherRetry: Retries.tryUp,
        ieRetry: Retries.ieTryUp,
        failure: BeforeAfter.adt.failedUp
      }
    };
  }
);