define(
  'ephox.alloy.api.behaviour.Keying',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    // These APIs are going to be interesting because they are not
    // available for all keying modes
    return BehaviourExport.build(
      'keying',
      [
        'focusIn',

        'setGridSize' // Only for "FlatgridType"
      ],
      { }
    );
  }
);