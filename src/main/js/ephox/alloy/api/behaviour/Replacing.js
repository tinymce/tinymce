define(
  'ephox.alloy.api.behaviour.Replacing',

  [
    'ephox.alloy.api.behaviour.BehaviourExport'
  ],

  function (BehaviourExport) {
    return BehaviourExport.build(
      'replacing',
      [
        'replace',
        'contents'
      ],
      { }
    );
  }
);