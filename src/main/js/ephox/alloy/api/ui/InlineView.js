define(
  'ephox.alloy.api.ui.InlineView',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.alloy.ui.schema.InlineViewSchema',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Fun'
  ],

  function (ComponentStructure, Positioning, Sandboxing, GuiTypes, UiSketcher, Dismissal, InlineViewSchema, Merger, Future, Fun) {
    var schema = InlineViewSchema.schema();

    var make = function (detail, spec) {
      return Merger.deepMerge(
        {
          uid: detail.uid(),
          dom: detail.dom(),
          behaviours: {
            sandboxing: {
              isPartOf: function (container, data, queryElem) {
                return ComponentStructure.isPartOf(data, queryElem);
              },
              getAttachPoint: function () {
                return detail.lazySink()().getOrDie();
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