define(
  'ephox.alloy.api.ui.InlineView',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Positioning',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Sandboxing',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.data.Fields',
    'ephox.alloy.sandbox.Dismissal',
    'ephox.boulder.api.FieldSchema',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option'
  ],

  function (ComponentStructure, Behaviour, Positioning, Receiving, Sandboxing, SketchBehaviours, Sketcher, Fields, Dismissal, FieldSchema, Fun, Merger, Option) {
    var factory = function (detail, spec) {
      var isPartOfRelated = function (container, queryElem) {
        var related = detail.getRelated()(container);
        return related.exists(function (rel) {
          return ComponentStructure.isPartOf(rel, queryElem);
        });
      };

      return Merger.deepMerge(
        {
          uid: detail.uid(),
          dom: detail.dom(),
          behaviours: Merger.deepMerge(
            Behaviour.derive([
              Sandboxing.config({
                isPartOf: function (container, data, queryElem) {
                  return ComponentStructure.isPartOf(data, queryElem) || isPartOfRelated(container, queryElem);
                },
                getAttachPoint: function () {
                  return detail.lazySink()().getOrDie();
                }
              }),
              Dismissal.receivingConfig({
                isExtraPart: Fun.constant(false)
              })
            ]),
            SketchBehaviours.get(detail.inlineBehaviours())
          ),
          eventOrder: detail.eventOrder(),

          apis: {
            showAt: function (sandbox, anchor, thing) {
              var sink = detail.lazySink()().getOrDie();
              Sandboxing.cloak(sandbox);
              Sandboxing.open(sandbox, thing);
              Positioning.position(sink, anchor, sandbox);
              Sandboxing.decloak(sandbox);
              detail.onShow()(sandbox);
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
        SketchBehaviours.field('inlineBehaviours', [ Sandboxing, Receiving ]),
        FieldSchema.defaulted('getRelated', Option.none),
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