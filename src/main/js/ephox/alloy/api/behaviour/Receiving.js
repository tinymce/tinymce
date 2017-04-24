define(
  'ephox.alloy.api.behaviour.Receiving',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.receiving.ActiveReceiving',
    'ephox.alloy.behaviour.receiving.ReceivingSchema'
  ],

  function (Behaviour, NoState, ActiveReceiving, ReceivingSchema) {
    return Behaviour.create(
      ReceivingSchema,
      'receiving',
      ActiveReceiving,
      { },
      { },
      NoState
    );
  }
);