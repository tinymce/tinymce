define(
  'ephox.alloy.behaviour.sandboxing.SandboxSchema',

  [
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.data.Fields',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Option'
  ],

  function (Positioning, Fields, FieldSchema, ValueSchema, Cell, Option) {
    return [
      FieldSchema.state('state', function () {
        return Cell(Option.none());
      }),
      Fields.onHandler('onOpen'),
      Fields.onHandler('onClose'),

      // TODO: async === false is untested
      FieldSchema.defaulted('async', true),

      // Maybe this should be optional
      FieldSchema.strict('isPartOf'),

      FieldSchema.strictOf('bucket', ValueSchema.choose('mode', {
        sink: [
          FieldSchema.strict('lazySink'),
          FieldSchema.state('glue', function () {
            var add = function (sandbox, bucketInfo) {
              var sink = bucketInfo.lazySink()().getOrDie();
              Positioning.addContainer(sink, sandbox);
              sink.getSystem().addToWorld(sandbox);
            };

            var remove = function (sandbox, bucketInfo) {
              var sink = bucketInfo.lazySink()().getOrDie();
              sink.getSystem().removeFromWorld(sandbox);
              Positioning.removeContainer(sink, sandbox);
            };

            return {
              add: add,
              remove: remove
            };
          })
        ]
      }))
    ];
  }
);