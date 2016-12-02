define(
  'ephox.alloy.api.behaviour.Receiving',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.receiving.ActiveReceiving',
    'ephox.alloy.behaviour.receiving.ReceivingSchema'
  ],

  function (BehaviourExport, ActiveReceiving, ReceivingSchema) {
    return BehaviourExport.santa(
      ReceivingSchema,
      'receiving',
      ActiveReceiving,
      { },
      { }
    );
  }
);