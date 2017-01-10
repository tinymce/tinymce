define(
  'ephox.alloy.api.behaviour.Streaming',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.behaviour.streaming.ActiveStreaming',
    'ephox.alloy.behaviour.streaming.StreamingSchema'
  ],

  function (Behaviour, ActiveStreaming, StreamingSchema) {
    return Behaviour.create(
      StreamingSchema,
      'streaming',
      ActiveStreaming,
      { },
      { }
    );
  }
);