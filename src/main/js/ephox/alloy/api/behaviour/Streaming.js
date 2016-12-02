define(
  'ephox.alloy.api.behaviour.Streaming',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.streaming.ActiveStreaming',
    'ephox.alloy.behaviour.streaming.StreamingSchema'
  ],

  function (BehaviourExport, ActiveStreaming, StreamingSchema) {
    return BehaviourExport.santa(
      StreamingSchema,
      'streaming',
      ActiveStreaming,
      { },
      { }
    );
  }
);