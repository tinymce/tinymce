define(
  'ephox.alloy.api.behaviour.Streaming',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.common.NoState',
    'ephox.alloy.behaviour.streaming.ActiveStreaming',
    'ephox.alloy.behaviour.streaming.StreamingSchema'
  ],

  function (Behaviour, NoState, ActiveStreaming, StreamingSchema) {
    return Behaviour.create({
      fields: StreamingSchema,
      name: 'streaming',
      active: ActiveStreaming,
      state: NoState
    });
  }
);