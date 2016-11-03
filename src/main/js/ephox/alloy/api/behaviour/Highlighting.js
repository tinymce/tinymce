define(
  'ephox.alloy.api.behaviour.Highlighting',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'global!Array'
  ],

  function (BehaviourExport, Array) {
    // If readability becomes a problem, stop dynamically generating these.
    return BehaviourExport.build(
      'highlighting',
      [
        'highlight',
        'dehighlight',
        'dehighlightAll',
        'highlightFirst',
        'highlightLast',
        'isHighlighted',
        'getHighlighted',
        'getFirst',
        'getLast',
        'getPrevious',
        'getNext'
      ],
      { }
    );
  }
);