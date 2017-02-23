define(
  'ephox.alloy.api.ui.ModalDialog',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ModalDialogSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Merger',
    'ephox.sand.api.JSON',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse',
    'global!Error'
  ],

  function (Behaviour, Keying, Positioning, GuiFactory, Container, GuiTypes, UiSketcher, PartType, ModalDialogSchema, FieldSchema, Merger, Json, Fun, Option, SelectorFind, Traverse, Error) {
    var schema = ModalDialogSchema.schema();
    var partTypes = ModalDialogSchema.parts();
        
    var make = function (detail, components, spec, externals) {
      var showDialog = function (dialog) {
        var sink = detail.lazySink()().getOrDie();
        var blocker = sink.getSystem().build(
          Merger.deepMerge(
            externals.blocker(),
            {
              components: [
                GuiFactory.premade(dialog)
              ]
            }
          )
        );

        sink.getSystem().addToWorld(blocker);
        Positioning.addContainer(sink, blocker);
        Keying.focusIn(dialog);
      };

      var hideDialog = function (dialog) {
        var sink = detail.lazySink()().getOrDie();
        Traverse.parent(dialog.element()).each(function (blockerDom) {
          dialog.getSystem().getByDom(blockerDom).each(function (blocker) {
            Positioning.removeContainer(sink, blocker);
            sink.getSystem().removeFromWorld(blocker);
          });
        });
      };

      var getDialogBody = function (dialog) {
        return dialog.getSystem().getByUid(detail.partUids().body).getOrDie();
      };

      return {
        dom: Merger.deepMerge({
          attributes: {
            role: 'dialog'
          }
        }, detail.dom()),
        components: components,
        apis: {
          show: showDialog,
          hide: hideDialog,
          getBody: getDialogBody
        },

        behaviours: {
          keying: {
            mode: 'cyclic',
            onEnter: detail.onExecute(),
            onEscape: detail.onEscape()
          }
        }
      };
    };

    var sketch = function (spec) {
      return UiSketcher.composite(ModalDialogSchema.name(), schema, partTypes, make, spec);
    };

    var parts = PartType.generate(ModalDialogSchema.name(), partTypes);


    return Merger.deepMerge(
      {
        sketch: sketch,
        parts: Fun.constant(parts)
      },

      GuiTypes.makeApis([ 'show', 'hide', 'getBody' ])
    );
  }
);