define(
  'ephox.alloy.api.ui.ExpandableForm',

  [
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Sliding',
    'ephox.alloy.api.ui.Sketcher',
    'ephox.alloy.parts.AlloyParts',
    'ephox.alloy.ui.schema.ExpandableFormSchema',
    'ephox.katamari.api.Merger'
  ],

  function (Behaviour, Representing, Sliding, Sketcher, AlloyParts, ExpandableFormSchema, Merger) {
    var runOnExtra = function (detail, operation) {
      return function (anyComp) {
        AlloyParts.getPart(anyComp, detail, 'extra').each(operation);
      };
    };

    var factory = function (detail, components, spec, _externals) {
      var getParts = function (form) {
        return AlloyParts.getPartsOrDie(form, detail, [ 'minimal', 'extra' ]);
      };

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: Merger.deepMerge(
          Behaviour.derive([
            Representing.config({
              store: {
                mode: 'manual',
                getValue: function (form) {
                  var parts = getParts(form);
                  var minimalValues = Representing.getValue(parts.minimal());
                  var extraValues = Representing.getValue(parts.extra());
                  return Merger.deepMerge(
                    minimalValues,
                    extraValues
                  );
                },
                setValue: function (form, values) {
                  var parts = getParts(form);
                  // ASSUMPTION: Form ignore values that it does not have.
                  Representing.setValue(parts.minimal(), values);
                  Representing.setValue(parts.extra(), values);
                }
              }
            })
          ]),
          detail.expandableBehaviours()
        ),

        apis: {
          toggleForm: runOnExtra(detail, Sliding.toggleGrow),
          collapseForm: runOnExtra(detail, Sliding.shrink),
          collapseFormImmediately: runOnExtra(detail, Sliding.immediateShrink),
          expandForm: runOnExtra(detail, Sliding.grow)
        }
      };

    };

    return Sketcher.composite({
      name: 'ExpandableForm',
      configFields: ExpandableFormSchema.schema(),
      partFields: ExpandableFormSchema.parts(),
      factory: factory,
      apis: {
        toggleForm: function (apis, component) {
          apis.toggleForm(component);
        },
        collapseForm: function (apis, component) {
          apis.collapseForm(component);
        },
        collapseFormImmediately: function (apis, component) {
          apis.collapseFormImmediately(component);
        },
        expandForm: function (apis, component) {
          apis.expandForm(component);
        }
      }
    });
  }
);