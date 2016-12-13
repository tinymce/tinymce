define(
  'ephox.alloy.api.ui.ModalDialog',

  [
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.ui.CompositeBuilder',
    'ephox.alloy.parts.PartType',
    'ephox.boulder.api.FieldSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (BehaviourExport, Keying, Positioning, CompositeBuilder, PartType, FieldSchema, Merger, Fun, SelectorFind, Traverse) {
    var schema = [
      FieldSchema.strict('blockerClass'),
      FieldSchema.strict('lazySink')
    ];

    var basic = { build: Fun.identity };

    var partTypes = [
      PartType.optional(basic, 'draghandle', '<alloy.dialog.draghandle>', Fun.constant({}), 
        function (detail) {
          return {
            behaviours: {
              dragging: {
                mode: 'mouse',
                getTarget: function (handle) {
                  return SelectorFind.ancestor(handle, '[role="dialog"]').getOr(handle);
                },
                blockerClass: detail.blockerClass()
              }
            }
          };
        }
      ),
      PartType.internal(basic, 'title', '<alloy.dialog.title>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'close', '<alloy.dialog.close>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'body', '<alloy.dialog.body>', Fun.constant({}), Fun.constant({})),
      PartType.internal(basic, 'footer', '<alloy.dialog.footer>', Fun.constant({}), Fun.constant({}))
    ];

    var build = function (spec) {
      return CompositeBuilder.build('modal-dialog', schema, partTypes, make, spec);
    };

    var parts = PartType.generate('modal-dialog', partTypes);

    

    var make = function (detail, components, spec, externals) {
      var showDialog = function (dialog) {
        var sink = detail.lazySink()().getOrDie();
        var blocker = sink.getSystem().build({
          uiType: 'custom',
          dom: {
            tag: 'div',
            styles: {
              'position': 'fixed',
              'left': '0px',
              'top': '0px',
              'right': '0px',
              'bottom': '0px',
              'background-color': 'rgba(20,20,20,0.5)',
              'z-index': '100000000'
            },
            // FIX: Remove hard-coding
            classes: [ 'ephox-gel-centered-dialog', 'ephox-gel-modal' ]
          },
          components: [
            { built: dialog }
          ]
        });

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

      return Merger.deepMerge(
        {
          dom: {
            attributes: {
              role: 'dialog'
            }
          }
        },
        {
          uiType: 'container',
          dom: detail.dom(),
          components: components,
          apis: {
            show: showDialog,
            hide: hideDialog
          },

          behaviours: {
            keying: {
              mode: 'cyclic'
            }
          }
        }
      );
    };

    var show = function (dialog) {
      var spi = dialog.config(BehaviourExport.spi());
      spi.show(dialog);
    };

    var hide = function (dialog) {
      var spi = dialog.config(BehaviourExport.spi());
      spi.hide(dialog);
    };

    return {
      build: build,
      parts: Fun.constant(parts),

      show: show,
      hide: hide
    };
  }
);