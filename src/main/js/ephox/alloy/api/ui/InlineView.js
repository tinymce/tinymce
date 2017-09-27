define(
  'ephox.alloy.api.ui.InlineView',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.data.Fields',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Future',
    'ephox.katamari.api.Merger'
  ],

  function (ComponentStructure, Behaviour, Positioning, Sandboxing, Sketcher, Fields, Dismissal, FieldSchema, Fun, Future, Merger) {
    var factory = function (detail, spec) {
      return Merger.deepMerge(
        {
          uid: detail.uid(),
          dom: detail.dom(),
          behaviours: Merger.deepMerge(
            Behaviour.derive([
              Sandboxing.config({
                isPartOf: function (container, data, queryElem) {
                  return ComponentStructure.isPartOf(data, queryElem);
                },
                getAttachPoint: function () {
                  return detail.lazySink()().getOrDie();
                }
              }),
              Dismissal.receivingConfig({
                isExtraPart: Fun.constant(false)
              })
            ]),
            detail.inlineBehaviours()
          ),
          eventOrder: detail.eventOrder(),

          apis: {
            showAt: function (sandbox, anchor, thing) {
              var sink = detail.lazySink()().getOrDie();
              Sandboxing.cloak(sandbox);
              Sandboxing.open(sandbox, Future.pure(thing)).get(function () {
                Positioning.position(sink, anchor, sandbox);
                Sandboxing.decloak(sandbox);
                detail.onShow()(sandbox);
              });
            },
            hide: function (sandbox) {
              Sandboxing.close(sandbox);
              detail.onHide()(sandbox);
            },
            isOpen: Sandboxing.isOpen
          }
        }
      );
    };

    return Sketcher.single({
      name: 'InlineView',
      configFields: [
        FieldSchema.strict('lazySink'),
        Fields.onHandler('onShow'),
        Fields.onHandler('onHide'),
        FieldSchema.defaulted('inlineBehaviours', { }),
        FieldSchema.defaulted('eventOrder')
      ],
      factory: factory,
      apis: {
        showAt: function (apis, component, anchor, thing) {
          apis.showAt(component, anchor, thing);
        },
        hide: function (apis, component) {
          apis.hide(component);
        },
        isOpen: function (apis, component) {
          return apis.isOpen(component);
        }
      }
    });
  }
);