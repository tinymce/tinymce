define(
  'ephox.alloy.api.behaviour.Disabling',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.highway.Merger',
    'ephox.sugar.api.Attr'
  ],

  function (BehaviourExport, Merger, Attr) {
    return Merger.deepMerge(
      BehaviourExport.build(
        'disabling',
        [
          'enable',
          'disable',
          'isDisabled'
        ],
        {
        }
      ),
      {
        // FIX: Is there a better way of sharing this code? Probably should be in sugar.
        isDisabledElem: function (elem) {
          return Attr.has(elem, 'disabled') || Attr.get(elem, 'aria-disabled') === 'true';
        }
      }
    );
  }
);