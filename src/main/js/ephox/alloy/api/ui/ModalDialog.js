define(
  'ephox.alloy.api.ui.ModalDialog',

  [
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.GuiTypes',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse',
    'global!Error'
  ],

  function (GuiFactory, Behaviour, Keying, Positioning, Container, GuiTypes, UiBuilder, PartType, FieldSchema, Merger, Json, Fun, Option, SelectorFind, Traverse, Error) {
    var schema = [
      FieldSchema.strict('lazySink'),
      FieldSchema.option('dragBlockClass'),

      FieldSchema.defaulted('onExecute', Option.none),
      FieldSchema.strict('onEscape')
    ];

    var basic = { build: Fun.identity };

    var partTypes = [
      PartType.optional(basic, 'draghandle', '<alloy.dialog.draghandle>', Fun.constant({}), 
        function (detail, spec) {
          return {
            behaviours: {
              dragging: {
                mode: 'mouse',
                getTarget: function (handle) {
                  return SelectorFind.ancestor(handle, '[role="dialog"]').getOr(handle);
                },
                blockerClass: detail.dragBlockClass().getOrDie(
                  new Error(
                    'The drag blocker class was not specified for a dialog with a drag handle: \n' + 
                    Json.stringify(spec, null, 2)
                  )
                )
              }
            }
          };
        }
      ),
      PartType.internal(basic, 'title', '<alloy.dialog.title>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'close', '<alloy.dialog.close>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'body', '<alloy.dialog.body>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'footer', '<alloy.dialog.footer>', Fun.constant({}), Fun.constant({})),

      PartType.external(basic, 'blocker', Fun.constant({
        dom: {
          tag: 'div',
          styles: {
            position: 'fixed',
            left: '0px',
            top: '0px',
            right: '0px',
            bottom: '0px'
          }
        }
      }), Fun.constant({ }))
    ];
    
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

      return Container.build({
        dom: detail.dom(),
        components: components,
        apis: {
          show: showDialog,
          hide: hideDialog,
          getBody: getDialogBody
        },

        domModification: {
          attributes: {
            role: 'dialog'
          }
        },

        behaviours: {
          keying: {
            mode: 'cyclic',
            onEnter: detail.onExecute(),
            onEscape: detail.onEscape()
          }
        }
      });
    };

    var build = function (spec) {
      return UiBuilder.composite('modal-dialog', schema, partTypes, make, spec);
    };

    var parts = PartType.generate('modal-dialog', partTypes);


    return Merger.deepMerge(
      {
        build: build,
        parts: Fun.constant(parts)
      },

      GuiTypes.makeApis([ 'show', 'hide', 'getBody' ])
    );
  }
);