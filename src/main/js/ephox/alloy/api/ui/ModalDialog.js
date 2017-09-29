define(
  'ephox.alloy.api.ui.ModalDialog',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.system.Attachment',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.ui.schema.ModalDialogSchema',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.search.Traverse',
    'global!Error'
  ],

  function (Behaviour, Keying, GuiFactory, SketchBehaviours, Attachment, Sketcher, AlloyParts, ModalDialogSchema, Merger, Traverse, Error) {
    var factory = function (detail, components, spec, externals) {
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
        Traverse.parent(dialog.element()).each(function (blockerDom) {
          dialog.getSystem().getByDom(blockerDom).each(function (blocker) {
            Attachment.detach(blocker);
          });
        });
      };

      var getDialogBody = function (dialog) {
        return AlloyParts.getPartOrDie(dialog, detail, 'body');
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

        behaviours: Merger.deepMerge(
          Behaviour.derive([
            Keying.config({
              mode: 'cyclic',
              onEnter: detail.onExecute(),
              onEscape: detail.onEscape(),
              useTabstopAt: detail.useTabstopAt()
            })
          ]),
          SketchBehaviours.get(detail.modalBehaviours())
        )
      };
    };

    return Sketcher.composite({
      name: 'ModalDialog',
      configFields: ModalDialogSchema.schema(),
      partFields: ModalDialogSchema.parts(),
      factory: factory,
      apis: {
        show: function (apis, dialog) {
          apis.show(dialog);
        },
        hide: function (apis, dialog) {
          apis.hide(dialog);
        },
        getBody: function (apis, dialog) {
          return apis.getBody(dialog);
        }
      }
    });
  }
);