define(
  'ephox.darwin.navigation.KeyDirection',

  [
    'ephox.darwin.keyboard.Retries',
    'ephox.darwin.navigation.BeforeAfter',
    'ephox.phoenix.api.dom.DomGather',
    'ephox.sugar.api.search.Traverse',
    'ephox.sugar.api.selection.Situ'
  ],

  function (Retries, BeforeAfter, DomGather, Traverse, Situ) {
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