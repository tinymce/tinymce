define(
  'ephox.alloy.api.ui.InlineView',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.alloy.ui.schema.InlineViewSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.knoch.future.Future',
    'ephox.peanut.Fun'
  ],

  function (ComponentStructure, Behaviour, Positioning, Sandboxing, GuiTypes, UiSketcher, Dismissal, InlineViewSchema, FieldSchema, Merger, Future, Fun) {
    var schema = InlineViewSchema.schema();

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

    var sketch = function (spec) {
      return UiSketcher.single(InlineViewSchema.name(), schema, make, spec);
    };

    return Merger.deepMerge(
      {
        sketch: sketch
      },
      GuiTypes.makeApis([ 'showAt', 'hide' ])
    );
  }
);