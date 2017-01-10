define(
  'ephox.alloy.api.ui.InlineView',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun'
  ],

  function (ComponentStructure, BehaviourExport, Positioning, Sandboxing, UiBuilder, Dismissal, FieldSchema, Merger, Future, Fun) {
    var schema = [
      FieldSchema.strict('lazySink'),
      FieldSchema.defaulted('onShow', Fun.noop)
    ];

    var make = function (detail, spec) {
      return Merger.deepMerge(
        spec,
        {
          uid: detail.uid(),
          dom: detail.dom(),
          behaviours: {
            sandboxing: {
              isPartOf: function (container, data, queryElem) {
                return ComponentStructure.isPartOf(data, queryElem);
              },
              bucket: {
                mode: 'sink',
                lazySink: detail.lazySink()
              }

            },
            receiving: Dismissal.receiving({
              isExtraPart: Fun.constant(false)
            })
          },

          apis: {
            showAt: function (sandbox, anchor, thing) {
              Sandboxing.open(sandbox, Future.pure(thing)).get(function () {
                var sink = detail.lazySink()().getOrDie();
                Positioning.position(sink, anchor, sandbox);
                detail.onShow()(sandbox);
              });
            },
            hide: function (sandbox) {
              Sandboxing.close(sandbox);
            }
          }
        }
      );
    };

    var build = function (spec) {
      return UiBuilder.single('InlineView', schema, make, spec);
    };

    return {
      build: build,

      showAt: function (sandbox, anchor, thing) {
        var spi = sandbox.config(BehaviourExport.spi());
        spi.showAt(sandbox, anchor, thing);
      },

      hide: function (sandbox) {
        var spi = sandbox.config(BehaviourExport.spi());
        spi.hide(sandbox);
      }
    };
  }
);