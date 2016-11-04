define(
  'ephox.alloy.spec.ModalDialogSpec',

  [
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.spec.SpecSchema',
    'ephox.alloy.spec.UiSubstitutes',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Traverse'
  ],

  function (Keying, Positioning, Behaviour, DomModification, SpecSchema, UiSubstitutes, FieldPresence, FieldSchema, ValueSchema, Merger, Fun, Option, SelectorFind, Traverse) {
    var schema = [
      FieldSchema.strict('dom'),
      FieldSchema.strict('onEscape'),
      FieldSchema.strict('lazySink'),
      FieldSchema.defaulted('draggable', false)
    ];

    var make = function (spec) {
      var detail = SpecSchema.asStructOrDie('modal-dialog', schema, spec, [
        'title',
        'close',
        'draghandle',
        'body',
        'footer'
      ]);

      var extra = detail.draggable() ? {
        '<alloy.dialog.draghandle>': UiSubstitutes.single(
          Merger.deepMerge(
            detail.parts().draghandle(),
            detail.parts().draghandle().base,
            {
              uid: detail.partUids().draghandle,
              dragging: {
                mode: 'mouse',
                getTarget: function (handle) {
                  return SelectorFind.ancestor(handle, '[role="dialog"]').getOr(handle);
                }
              }
            }
          )
        )
      } : { };

      var placeholders = Merger.deepMerge(
        {
          '<alloy.dialog.title>': UiSubstitutes.single(
            Merger.deepMerge(
              detail.parts().title(),
              detail.parts().title().base,
              {
                uid: detail.partUids().title
              }
            )
          ),
          '<alloy.dialog.close>': UiSubstitutes.single(
            Merger.deepMerge(
              detail.parts().close(),
              detail.parts().close().base,
              {
                uid: detail.partUids().close
              }
            )
          ),
          '<alloy.dialog.body>': UiSubstitutes.single(
            Merger.deepMerge(
              detail.parts().body(),
              detail.parts().body().base,
              {
                uid: detail.partUids().body
              }
            )
          ),
          '<alloy.dialog.footer>': UiSubstitutes.single(
            Merger.deepMerge(
              detail.parts().footer(),
              detail.parts().footer().base,
              {
                uid: detail.partUids().footer
              }
            )
          )
        },
        extra
      );

      var components = UiSubstitutes.substitutePlaces(
        Option.some('modal-dialog'),
        detail,
        detail.components(),
        placeholders,
        { }
      );

      return Merger.deepMerge(
        spec,
        {
          uiType: 'custom',
          dom: detail.dom(),
          components: components,
          keying: {
            mode: 'cyclic',
            onEscape: detail.onEscape()
          },
          behaviours: [
            Behaviour.contract({
              name: Fun.constant('modal-dialog-spec'),
              exhibit: Fun.constant(DomModification.nu({})),
              handlers: Fun.constant({ }),
              apis: function () {
                return {
                  showDialog: function (dialog) {
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
                  },
                  hideDialog: function (dialog) {
                    console.log('hiding dialog');
                    var sink = detail.lazySink()().getOrDie();
                    Traverse.parent(dialog.element()).each(function (parent) {
                      dialog.getSystem().getByDom(parent).each(function (blocker) {
                        Positioning.removeContainer(sink, blocker);
                        sink.getSystem().removeFromWorld(blocker);
                      });
                    });
                  },
                  getBody: function (dialog) {
                    return dialog.getSystem().getByUid(detail.partUids().body);
                  }
                };
              },
              schema: Fun.constant(FieldSchema.field('_', '_', FieldPresence.asOption(), ValueSchema.anyValue()))
            })

          ]
        }
      );
    };

    return {
      make: make
    };
  }
);