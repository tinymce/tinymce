define(
  'ephox.alloy.behaviour.sandboxing.SandboxSchema',

  [
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Cell'
  ],

  function (Positioning, FieldSchema, ValueSchema, Fun, Option, Cell) {
    return [
      FieldSchema.state('state', function () {
        return Cell(Option.none());
      }),
      FieldSchema.defaulted('onOpen', Fun.noop),
      FieldSchema.defaulted('onClose', Fun.noop),

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