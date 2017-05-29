define(
  'ephox.alloy.api.ui.FormCoupledInputs',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.ui.schema.FormCoupledInputsSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Option'
  ],

  function (Behaviour, Composing, Representing, Sketcher, AlloyParts, FormCoupledInputsSchema, Objects, Option) {

    var factory = function (detail, components, spec, externals) {
      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: Behaviour.derive([
          Composing.config({ find: Option.some }),

          Representing.config({
            store: {
              mode: 'manual',
              getValue: function (comp) {
                var parts = AlloyParts.getPartsOrDie(comp, detail, [ 'field1', 'field2' ]);
                return {
                  field1: Representing.getValue(parts.field1()),
                  field2: Representing.getValue(parts.field2())
                };
              },
              setValue: function (comp, value) {
                var parts = AlloyParts.getPartsOrDie(comp, detail, [ 'field1', 'field2' ]);
                if (Objects.hasKey(value, 'field1')) Representing.setValue(parts.field1(), value.field1);
                if (Objects.hasKey(value, 'field2')) Representing.setValue(parts.field2(), value.field2);
              }
            }
          })
        ])
      };
    };

    return Sketcher.composite({
      name: 'FormCoupledInputs',
      configFields: FormCoupledInputsSchema.schema(),
      partFields: FormCoupledInputsSchema.parts(),
      factory: factory
    });
  }
);