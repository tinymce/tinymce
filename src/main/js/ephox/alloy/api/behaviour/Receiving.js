define(
  'ephox.alloy.api.behaviour.Receiving',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.receiving.ActiveReceiving',
    'ephox.alloy.behaviour.receiving.ReceivingSchema'
  ],

  function (Behaviour, ActiveReceiving, ReceivingSchema) {
    return Behaviour.create({
      fields: ReceivingSchema,
      name: 'receiving',
      active: ActiveReceiving
    });
  }
);