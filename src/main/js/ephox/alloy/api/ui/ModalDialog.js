define(
  'ephox.alloy.api.ui.ModalDialog',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.ModalDialogSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'ephox.sand.api.JSON',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Traverse',
    'global!Error'
  ],

  function (
    Behaviour, Keying, Positioning, GuiFactory, Attachment, Container, GuiTypes, UiSketcher, PartType, ModalDialogSchema, FieldSchema, Fun, Merger, Option, Json,
    SelectorFind, Traverse, Error
  ) {
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

        Attachment.attach(sink, blocker);
        Keying.focusIn(dialog);
      };

      var hideDialog = function (dialog) {
        var sink = detail.lazySink()().getOrDie();
        Traverse.parent(dialog.element()).each(function (blockerDom) {
          dialog.getSystem().getByDom(blockerDom).each(function (blocker) {
            Attachment.detach(blocker);
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

        behaviours: Behaviour.derive([
          Keying.config({
            mode: 'cyclic',
            onEnter: detail.onExecute(),
            onEscape: detail.onEscape()
          })
        ])
      };
    };

    var sketch = function (spec) {
      return UiSketcher.composite(ModalDialogSchema.name(), schema, partTypes, make, spec);
    };

    var parts = PartType.generate(ModalDialogSchema.name(), partTypes);


    return Merger.deepMerge(
      {
        sketch: sketch,
        parts: Fun.constant(parts),
        schemas: Fun.constant(ModalDialogSchema),
        show: GuiTypes.makeApi(function (apis, dialog) {
          apis.show(dialog);
        }),
        hide: GuiTypes.makeApi(function (apis, dialog) {
          apis.hide(dialog);
        }),
        getBody: GuiTypes.makeApi(function (apis, dialog) {
          return apis.getBody(dialog);
        })
      }
    );
  }
);