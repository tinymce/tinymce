define(
  'ephox.alloy.api.ui.FormField',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.SketchBehaviours',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.ui.schema.FormFieldSchema',
    'ephox.katamari.api.Id',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.properties.Attr'
  ],

  function (Behaviour, Composing, Representing, SketchBehaviours, AlloyEvents, Sketcher, AlloyParts, FormFieldSchema, Id, Merger, Attr) {
    var factory = function (detail, components, spec, externals) {
      var behaviours = Merger.deepMerge(
        Behaviour.derive([
          Composing.config({
            find: function (container) {
              return AlloyParts.getPart(container, detail, 'field');
            }
          }),

          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (field) {
                return Composing.getCurrent(field).bind(Representing.getValue);
              },
              setValue: function (field, value) {
                Composing.getCurrent(field).each(function (current) {
                  Representing.setValue(current, value);
                });
              }
            }
          })
        ]),
        SketchBehaviours.get(detail.fieldBehaviours())
      );

      var events = AlloyEvents.derive([
        // Used to be systemInit
        AlloyEvents.runOnAttached(function (component, simulatedEvent) {
          var ps = AlloyParts.getParts(component, detail, [ 'label', 'field' ]);
          ps.label().each(function (label) {
            ps.field().each(function (field) {
              var id = Id.generate(detail.prefix());

              // TODO: Find a nicer way of doing this.
              Attr.set(label.element(), 'for', id);
              Attr.set(field.element(), 'id', id);
            });
          });
        })
      ]);

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,
        behaviours: behaviours,
        events: events
      };
    };

    return Sketcher.composite({
      name: 'FormField',
      configFields: FormFieldSchema.schema(),
      partFields: FormFieldSchema.parts(),
      factory: factory
    });
  }
);